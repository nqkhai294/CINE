const db = require("../db");

module.exports.logView = async (req, res) => {
  try {
    const { movieId } = req.body;
    const userId = req.user.id; // Get from middleware 'protect'

    if (!movieId) {
      return res.status(400).json({ message: "Miss movie ID !" });
    }

    const upsertQuery = {
      text: `INSERT INTO views (user_id, movie_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, movie_id)
        DO UPDATE SET viewed_at = NOW()`,
      values: [userId, movieId],
    };
    await db.query(upsertQuery);

    return res.status(201).json({
      result: {
        status: "ok",
        message: "View logged successfully",
      },
    });
  } catch (error) {
    console.error("Error logging view:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getUserViews = async (req, res) => {
  try {
    const userId = req.user.id; // Get from middleware 'protect'

    const query = {
      text: `SELECT viewed_at, id, title, poster_url, release_year, tmdb_vote_average
         FROM (
           SELECT DISTINCT ON (m.id)
             v.viewed_at,
             m.id, m.title, m.poster_url, m.release_year, m.tmdb_vote_average
           FROM views v
           JOIN movies m ON v.movie_id = m.id
           WHERE v.user_id = $1
           ORDER BY m.id, v.viewed_at DESC
         ) AS unique_views
         ORDER BY viewed_at DESC`,
      values: [userId],
    };
    const result = await db.query(query);

    return res.status(200).json({
      result: {
        status: "ok",
        views: result.rows,
      },
    });
  } catch (error) {
    console.error("Error getting user views:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
