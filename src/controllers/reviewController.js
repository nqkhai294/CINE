// src/controllers/reviewController.js
const db = require("../db");

/**
 * API: Thêm hoặc Sửa một BÌNH LUẬN
 */
module.exports.addOrUpdateReview = async (req, res) => {
  try {
    const { movieId, content } = req.body; // Lần này là 'content'
    const userId = req.user.id; // Lấy từ middleware

    // 1. Kiểm tra đầu vào
    if (!movieId || !content) {
      return res.status(400).json({ message: "Thiếu movieId hoặc content" });
    }
    if (content.trim() === "") {
      return res.status(400).json({ message: "Bình luận không được để trống" });
    }

    // 2. Thêm hoặc Cập nhật (UPSERT)
    // Dùng ON CONFLICT trên (user_id, movie_id)
    const query = {
      text: `INSERT INTO Reviews (user_id, movie_id, content)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id, movie_id)
             DO UPDATE SET content = $3, updated_at = CURRENT_TIMESTAMP
             RETURNING *`,
      values: [userId, movieId, content],
    };

    const { rows } = await db.query(query);

    res.status(201).json({
      result: { status: "ok", message: "Bình luận đã được lưu" },
      data: rows[0],
    });
  } catch (error) {
    console.error("Lỗi khi thêm/sửa review:", error);
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
      // JOIN với Users để lấy username
      text: `SELECT R.content, R.created_at, R.updated_at, U.username 
             FROM Reviews R
             JOIN Users U ON R.user_id = U.id
             WHERE R.movie_id = $1
             ORDER BY R.created_at DESC`,
      values: [movieId],
    };

    const { rows } = await db.query(query);

    res.status(200).json({
      result: { status: "ok", message: "Tải bình luận thành công" },
      data: rows,
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
