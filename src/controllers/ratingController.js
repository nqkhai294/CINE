const db = require("../db");

/**
 * Đánh giá hoặc cập nhật đánh giá cho một phim
 * @param {*} req
 * @param {*} res
 * @returns
 */
module.exports.addOrUpdateRating = async (req, res) => {
  try {
    console.log(req.body);
    const { movieId, score } = req.body;
    const userId = req.user.id;

    if (!movieId || !score) {
      return res
        .status(400)
        .json({ message: "movieId and score are required" });
    }
    const scoreNum = parseInt(score, 10);

    if (scoreNum < 1 || scoreNum > 5) {
      return res.status(400).json({ message: "Score must be between 1 and 5" });
    }

    /* Add or Update 
         "ON CONFLICT ... DO UPDATE" automatically handles
         - Insert if no existing rating
         - Update if rating already exists
     */
    const query = {
      text: `INSERT INTO ratings (user_id, movie_id, rating)
               VALUES ($1, $2, $3)
               ON CONFLICT (user_id, movie_id)
               DO UPDATE SET rating = $3, rated_at = CURRENT_TIMESTAMP
               RETURNING *`,
      values: [userId, movieId, scoreNum],
    };

    const { rows } = await db.query(query);

    // Run trigger cập nhật avg_rating trong database
    console.log(
      `Rating cho phim ${movieId} đã được cập nhật. Trigger sẽ tự cập nhật avg_rating`,
    );

    res.status(200).json({
      result: {
        status: "ok",
        message: "Đánh giá đã được lưu",
      },
      data: rows[0],
    });
  } catch (error) {
    console.error("Error in addOrUpdateRating:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * API: Lấy tất cả đánh giá cho 1 bộ phim
 *
 */
module.exports.getRatingsForMovie = async (req, res) => {
  try {
    const { movieId } = req.params;

    const query = {
      text: `SELECT R.rating, R.rated_at, U.username
             FROM ratings R
             JOIN users U ON R.user_id = U.id
             WHERE R.movie_id = $1
             ORDER BY R.rated_at DESC`,
      values: [movieId],
    };

    const { rows } = await db.query(query);

    res.status(200).json({
      result: {
        status: "ok",
        message: "Lấy đánh giá thành công",
      },
      data: rows,
      total: rows.length,
    });
  } catch (error) {
    console.error("Error in getRatingsForMovie:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * API: Lấy tất cả đánh giá từ 1 người dùng
 */

module.exports.getRatingsFromUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const query = {
      text: `SELECT R.rating, R.rated_at, M.title, M.id, M.poster_url
             FROM ratings R
             JOIN movies M ON R.movie_id = M.id
             WHERE R.user_id = $1
             ORDER BY R.rated_at DESC`,
      values: [userId],
    };

    const { rows } = await db.query(query);

    res.status(200).json({
      result: {
        status: "ok",
        message: "Lấy đánh giá thành công",
      },
      data: rows,
      total: rows.length,
    });
  } catch (error) {
    console.error("Error in getRatingsFromUser:", error);
    res.status(500).json({ message: "Server error" });
  }
};
