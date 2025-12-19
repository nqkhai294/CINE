// src/controllers/reviewController.js
const db = require("../db");

/**
 * API: Thêm hoặc Sửa một BÌNH LUẬN
 */
module.exports.addReview = async (req, res) => {
  try {
    const { movieId, content } = req.body;
    const userId = req.user.id;

    // 1. Kiểm tra đầu vào (Giữ nguyên)
    if (!movieId || !content) {
      return res.status(400).json({ message: "Thiếu movieId hoặc content" });
    }
    if (content.trim() === "") {
      return res.status(400).json({ message: "Bình luận không được để trống" });
    }

    // 2. Thay đổi logic: Luôn luôn INSERT (thêm mới)
    // Đã xóa bỏ "ON CONFLICT"
    const query = {
      text: `INSERT INTO Reviews (user_id, movie_id, content)
             VALUES ($1, $2, $3)
             RETURNING *`, // Vẫn trả về để xác nhận
      values: [userId, movieId, content],
    };

    const { rows } = await db.query(query);

    res.status(201).json({
      result: { status: "ok", message: "Đã đăng bình luận" }, // Đổi thông báo
      data: rows[0],
    });
  } catch (error) {
    console.error("Lỗi khi thêm review:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * API: Lấy TẤT CẢ bình luận cho MỘT bộ phim
 */
module.exports.getReviewsForMovie = async (req, res) => {
  try {
    const { movieId } = req.params;

    const query = {
      // JOIN với Users và user_profiles để lấy đầy đủ thông tin
      text: `SELECT 
               R.id,
               R.content,
               R.created_at,
               U.id as user_id,
               U.display_name,
               UP.avatar_url
             FROM Reviews R
             JOIN Users U ON R.user_id = U.id
             LEFT JOIN user_profiles UP ON U.id = UP.user_id
             WHERE R.movie_id = $1
             ORDER BY R.created_at DESC`,
      values: [movieId],
    };

    const { rows } = await db.query(query);

    // Format data theo interface Comment
    const formattedData = rows.map((row) => ({
      id: row.id,
      user: {
        id: row.user_id,
        name: row.display_name,
        avatar: row.avatar_url || "/default-avatar.png", // default avatar nếu null
      },
      content: row.content,
      createdAt: row.created_at,
    }));

    res.status(200).json({
      result: { status: "ok", message: "Tải bình luận thành công" },
      data: formattedData,
    });
  } catch (error) {
    console.error("Lỗi khi lấy reviews cho phim:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * API: Lấy TẤT CẢ bình luận từ MỘT người dùng
 */
module.exports.getReviewsFromUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const query = {
      // JOIN với Movies để lấy tên phim
      text: `SELECT R.content, R.created_at, M.id, M.title, M.poster_url 
             FROM Reviews R
             JOIN Movies M ON R.movie_id = M.id
             WHERE R.user_id = $1
             ORDER BY R.created_at DESC`,
      values: [userId],
    };

    const { rows } = await db.query(query);

    res.status(200).json({
      result: {
        status: "ok",
        message: "Tải bình luận của người dùng thành công",
      },
      data: rows,
    });
  } catch (error) {
    console.error("Lỗi khi lấy reviews của user:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
