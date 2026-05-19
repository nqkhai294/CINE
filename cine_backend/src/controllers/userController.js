const db = require("../db");

module.exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const query = {
      text: `SELECT u.id,
                    u.username,
                    u.email,
                    u.role,
                    up.avatar_url,
                    up.bio,
                    up.date_of_birth,
                    up.gender,
                    up.updated_at AS profile_updated_at
             FROM users u
             LEFT JOIN user_profiles up ON u.id = up.user_id
             WHERE u.id = $1`,
      values: [userId],
    };

    const { rows } = await db.query(query);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User profile not found" });
    }

    const r = rows[0];
    res.status(200).json({
      result: {
        message: "success",
        status: "ok",
      },
      data: {
        id: r.id,
        user_id: r.id,
        username: r.username,
        email: r.email,
        role: r.role || 0,
        avatar_url: r.avatar_url || null,
        bio: r.bio ?? null,
        date_of_birth: r.date_of_birth ?? null,
        gender: r.gender ?? null,
        profile_updated_at: r.profile_updated_at ?? null,
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin user:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports.updateUserProfile = async (req, res) => {
  try {
    const { bio, date_of_birth, gender } = req.body;
    const userId = req.user.id; // Lấy từ middleware auth

    // Validation cơ bản
    if (date_of_birth && isNaN(Date.parse(date_of_birth))) {
      return res
        .status(400)
        .json({ message: "Invalid date format for date_of_birth" });
    }

    if (gender && !["male", "female", "other"].includes(gender.toLowerCase())) {
      return res
        .status(400)
        .json({ message: "Gender must be: male, female, or other" });
    }

    // Update profile (chỉ update các field được gửi)
    const updateFields = [];
    const values = [];
    let paramCount = 0;

    if (bio !== undefined) {
      updateFields.push(`bio = $${++paramCount}`);
      values.push(bio);
    }

    if (date_of_birth !== undefined) {
      updateFields.push(`date_of_birth = $${++paramCount}`);
      values.push(date_of_birth);
    }
    if (gender !== undefined) {
      updateFields.push(`gender = $${++paramCount}`);
      values.push(gender.toLowerCase());
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    // Thêm updated_at và user_id
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const query = {
      text: `UPDATE user_profiles 
             SET ${updateFields.join(", ")} 
             WHERE user_id = $${++paramCount}
             RETURNING *`,
      values: values,
    };

    const { rows } = await db.query(query);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User profile not found" });
    }

    res.status(200).json({
      result: {
        message: "Profile updated successfully",
        status: "ok",
      },
      data: rows[0],
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật profile:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports.updateUserAvatar = async (req, res) => {
  try {
    const { avatar_url } = req.body;
    const userId = req.user.id; // Lấy từ middleware auth

    if (!avatar_url || typeof avatar_url !== "string") {
      return res.status(400).json({ message: "Invalid avatar URL" });
    }

    const query = {
      text: `UPDATE user_profiles 
             SET avatar_url = $1, updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $2
             RETURNING *`,
      values: [avatar_url, userId],
    };

    const { rows } = await db.query(query);

    if (!rows.length) {
      return res.status(404).json({ message: "User profile not found" });
    }

    res.status(200).json({
      result: {
        message: "Avatar updated successfully",
        status: "ok",
      },
      data: rows[0],
    });
  } catch (error) {
    console.log("Lỗi khi cập nhật avatar:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// ADMIN MANAGEMENT APIs

module.exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    let countQuery = `SELECT COUNT(*) FROM users WHERE username ILIKE $1 OR email ILIKE $1`;
    let query = `
      SELECT u.id, u.username, u.email, u.role, u.created_at,
             up.avatar_url, up.bio, up.gender
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.username ILIKE $1 OR u.email ILIKE $1
      ORDER BY u.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const searchTerm = `%${search}%`;
    const countResult = await db.query(countQuery, [searchTerm]);
    const { rows } = await db.query(query, [searchTerm, limit, offset]);

    res.status(200).json({
      result: {
        message: "success",
        status: "ok",
      },
      data: {
        users: rows,
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (role === undefined || ![0, 1].includes(parseInt(role))) {
      return res.status(400).json({
        message: "Role phải là 0 (User) hoặc 1 (Admin)",
      });
    }

    const query = {
      text: `UPDATE users SET role = $1 WHERE id = $2 RETURNING id, username, email, role`,
      values: [parseInt(role), userId],
    };

    const { rows } = await db.query(query);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.status(200).json({
      result: {
        message: "Cập nhật role thành công",
        status: "ok",
      },
      data: rows[0],
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật role:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports.adminUpdateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { email, username, display_name } = req.body;

    // Kiểm tra email hoặc username đã tồn tại chưa
    if (email || username) {
      const checkQuery = {
        text: `SELECT id FROM users WHERE (email = $1 OR username = $2) AND id != $3`,
        values: [email || "", username || "", userId],
      };
      const checkResult = await db.query(checkQuery);
      if (checkResult.rows.length > 0) {
        return res.status(409).json({
          message: "Email hoặc username đã tồn tại",
        });
      }
    }

    const updateFields = [];
    const values = [];
    let paramCount = 0;

    if (email) {
      updateFields.push(`email = $${++paramCount}`);
      values.push(email);
    }
    if (username) {
      updateFields.push(`username = $${++paramCount}`);
      values.push(username);
    }
    if (display_name) {
      updateFields.push(`display_name = $${++paramCount}`);
      values.push(display_name);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        message: "Phải cung cấp ít nhất một trường để cập nhật",
      });
    }

    values.push(userId);
    const query = {
      text: `UPDATE users SET ${updateFields.join(", ")} WHERE id = $${++paramCount} RETURNING id, username, email, display_name, role`,
      values: values,
    };

    const { rows } = await db.query(query);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.status(200).json({
      result: {
        message: "Cập nhật thông tin người dùng thành công",
        status: "ok",
      },
      data: rows[0],
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin người dùng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({
        message: "Không thể xóa tài khoản của chính mình",
      });
    }

    // Kiểm tra user tồn tại
    const checkResult = await db.query("SELECT id FROM users WHERE id = $1", [
      userId,
    ]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Xóa user_profiles
    await db.query("DELETE FROM user_profiles WHERE user_id = $1", [userId]);

    const deleteResult = await db.query(
      "DELETE FROM users WHERE id = $1 RETURNING id, username, email",
      [userId],
    );

    res.status(200).json({
      result: {
        message: "Xóa người dùng thành công",
        status: "ok",
      },
      data: deleteResult.rows[0],
    });
  } catch (error) {
    console.error("Lỗi khi xóa người dùng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
