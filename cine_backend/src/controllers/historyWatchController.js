const db = require("../db");

module.exports.logView = async (req, res) => {
  try {
    const { movieId } = req.body;
    const userId = req.user.id; // Get from middleware 'protect'

    if (!movieId) {
      return res.status(400).json({ message: "Miss movie ID !" });
    }

    // Check if record exists
    const checkQuery = {
      text: `SELECT id FROM views WHERE user_id = $1 AND movie_id = $2`,
      values: [userId, movieId],
    };

    const existingRecord = await db.query(checkQuery);

    if (existingRecord.rows.length > 0) {
      // Update existing record
      const updateQuery = {
        text: `UPDATE views SET viewed_at = NOW() WHERE user_id = $1 AND movie_id = $2`,
        values: [userId, movieId],
      };
      await db.query(updateQuery);
    } else {
      // Insert new record
      const insertQuery = {
        text: `INSERT INTO views (user_id, movie_id) VALUES ($1, $2)`,
        values: [userId, movieId],
      };
      await db.query(insertQuery);
    }

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
      text: `SELECT 
         v.viewed_at, 
         m.id, m.title, m.poster_url, m.release_year, m.tmdb_vote_average
         from views v
         join movies m on v.movie_id = m.id
         where v.user_id = $1
         order by v.viewed_at desc`,
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
