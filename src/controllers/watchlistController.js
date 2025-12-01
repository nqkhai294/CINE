const db = require("../db");

/**
 * API: Thêm phim vào watchlist
 * POST /api/watchlist
 */
module.exports.addToWatchlist = async (req, res) => {
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

    // Thêm vào watchlist (ON CONFLICT để tránh trùng lặp)
    const query = {
      text: `INSERT INTO user_watchlist (user_id, movie_id)
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
          message: "Movie already in watchlist",
        },
      });
    }

    res.status(201).json({
      result: {
        status: "ok",
        message: "Movie added to watchlist successfully",
      },
      data: rows[0],
    });
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * API: Xóa phim khỏi watchlist
 * DELETE /api/watchlist/:movieId
 */
module.exports.removeFromWatchlist = async (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = req.user.id;

    const query = {
      text: `DELETE FROM user_watchlist 
             WHERE user_id = $1 AND movie_id = $2
             RETURNING *`,
      values: [userId, movieId],
    };

    const { rows } = await db.query(query);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Movie not found in watchlist" });
    }

    res.status(200).json({
      result: {
        status: "ok",
        message: "Movie removed from watchlist successfully",
      },
    });
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * API: Lấy danh sách watchlist của user
 * GET /api/watchlist
 */
module.exports.getWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = {
      text: `SELECT 
               w.added_at,
               m.id, m.title, m.poster_url, m.avg_rating, 
               m.release_year, m.summary,
               COALESCE(
                 (SELECT JSON_AGG(g.name) 
                  FROM Movie_Genres mg 
                  JOIN Genres g ON mg.genre_id = g.id 
                  WHERE mg.movie_id = m.id),
                 '[]'::json
               ) AS genres
             FROM user_watchlist w
             JOIN movies m ON w.movie_id = m.id
             WHERE w.user_id = $1
             ORDER BY w.added_at DESC`,
      values: [userId],
    };

    const { rows } = await db.query(query);

    res.status(200).json({
      result: {
        status: "ok",
        message: "Watchlist retrieved successfully",
      },
      data: rows,
      total: rows.length,
    });
  } catch (error) {
    console.error("Error getting watchlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * API: Kiểm tra phim có trong watchlist không
 * GET /api/watchlist/check/:movieId
 */
module.exports.checkInWatchlist = async (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = req.user.id;

    const query = {
      text: `SELECT EXISTS(
               SELECT 1 FROM user_watchlist 
               WHERE user_id = $1 AND movie_id = $2
             ) as in_watchlist`,
      values: [userId, movieId],
    };

    const { rows } = await db.query(query);

    res.status(200).json({
      result: {
        status: "ok",
        message: "Check completed",
      },
      data: {
        in_watchlist: rows[0].in_watchlist,
        movie_id: movieId,
      },
    });
  } catch (error) {
    console.error("Error checking watchlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * API: Lấy số lượng phim trong watchlist
 * GET /api/watchlist/count
 */
module.exports.getWatchlistCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = {
      text: `SELECT COUNT(*) as count FROM user_watchlist WHERE user_id = $1`,
      values: [userId],
    };

    const { rows } = await db.query(query);

    res.status(200).json({
      result: {
        status: "ok",
        message: "Count retrieved successfully",
      },
      data: {
        count: parseInt(rows[0].count),
      },
    });
  } catch (error) {
    console.error("Error getting watchlist count:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
