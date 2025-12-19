const db = require("../db");

module.exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params; // Dùng params thay vì body cho GET

    const query = {
      text: `SELECT up.*, u.username, u.email 
             FROM user_profiles up
             JOIN users u ON up.user_id = u.id
             WHERE up.user_id = $1`,
      values: [userId],
    };

    const { rows } = await db.query(query);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User profile not found" });
    }

    res.status(200).json({
      result: {
        message: "success",
        status: "ok",
      },
      data: rows[0],
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

    const rows = await db.query(query);

    if (rows.length === 0) {
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
