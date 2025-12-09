const db = require("../db");

/**
 * API: Thêm phim vào danh sách yêu thích
 * POST /api/favourites
 */
module.exports.addToFavourites = async (req, res) => {
  try {
    const { movieId } = req.body;
    const userId = req.user.id; // Từ middleware auth

    if (!movieId) {
      return res.status(400).json({ message: "Movie ID is required" });
    }

    // Kiểm tra phim có tồn tại không
    const movieCheck = await db.query("SELECT id FROM movies WHERE id = $1", [
      movieId,
    ]);

    if (movieCheck.rows.length === 0) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // Thêm vào danh sách yêu thích (ON CONFLICT để tránh trùng lặp)
    const query = {
      text: `INSERT INTO user_favourites (user_id, movie_id)
             VALUES ($1, $2)
             ON CONFLICT (user_id, movie_id) DO NOTHING
             RETURNING *`,
      values: [userId, movieId],
    };

    const { rows } = await db.query(query);

    if (rows.length === 0) {
      return res.status(200).json({
        result: {
          status: "ok",
          message: "Movie already in favourites",
        },
      });
    }

    res.status(201).json({
      result: {
        status: "ok",
        message: "Movie added to favourites successfully",
      },
      data: rows[0],
    });
  } catch (error) {
    console.error("Error adding to favourites:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * API: Xóa phim khỏi danh sách yêu thích
 * DELETE /api/favourites/:movieId
 */
module.exports.removeFromFavourites = async (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = req.user.id;

    const query = {
      text: `DELETE FROM user_favourites
                   WHERE user_id = $1 AND movie_id = $2
                   RETURNING *`,
      values: [userId, movieId],
    };

    const { rows } = await db.query(query);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Movie not found in favourites" });
    }

    res.status(200).json({
      result: {
        status: "ok",
        message: "Movie removed from favourites successfully",
      },
    });
  } catch (error) {
    console.error("Error removing from favourites:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * API: Lấy danh sách phim yêu thích của user
 * GET /api/favourites
 */
module.exports.getFavourites = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = {
      text: `SELECT 
               f.added_at,
               m.id, m.title, m.poster_url, m.avg_rating, 
               m.release_year, m.summary,
               COALESCE(
                 (SELECT JSON_AGG(g.name) 
                  FROM Movie_Genres mg 
                  JOIN Genres g ON mg.genre_id = g.id 
                  WHERE mg.movie_id = m.id),
                 '[]'::json
               ) AS genres
             FROM user_favourites f
             JOIN movies m ON f.movie_id = m.id
             WHERE f.user_id = $1
             ORDER BY f.added_at DESC`,
      values: [userId],
    };

    const { rows } = await db.query(query);

    res.status(200).json({
      result: {
        status: "ok",
        message: "Favourites fetched successfully",
      },
      data: rows,
      total: rows.length,
    });
  } catch (error) {
    console.error("Error fetching favourites:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * API: Kiểm tra phim có trong danh sách yêu thích không
 * GET /api/favourites/check/:movieId
 */
module.exports.checkInFavourites = async (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = req.user.id;

    const query = {
      text: `SELECT EXISTS(
                SELECT 1 FROM user_favourites
                WHERE user_id = $1 AND movie_id = $2
                ) AS is_favourite`,
      values: [userId, movieId],
    };

    const { rows } = await db.query(query);

    res.status(200).json({
      result: {
        status: "ok",
        message: "Check completed successfully",
      },
      data: {
        isFavourite: rows[0].is_favourite,
      },
    });
  } catch (error) {
    console.error("Error checking favourites:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * API: Lấy số lượng phim trong danh sách yêu thích
 * GET /api/favourites/count
 */
module.exports.getFavouritesCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = {
      text: `SELECT COUNT(*) AS count FROM user_favourites WHERE user_id = $1`,
      values: [userId],
    };

    const { rows } = await db.query(query);

    res.status(200).json({
      result: {
        status: "ok",
        message: "Count retrieved successfully",
      },
      data: {
        count: parseInt(rows[0].count, 10),
      },
    });
  } catch (error) {
    console.error("Error getting favourites count:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
