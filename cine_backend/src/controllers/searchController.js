const db = require("../db");

module.exports.searchMovies = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword || keyword.trim() === "") {
      return res.status(400).json({ message: "Missing search keyword!" });
    }

    const query = {
      text: `SELECT m.*, 
             COALESCE(
               (SELECT JSON_AGG(g.name) 
                FROM Movie_Genres mg 
                JOIN Genres g ON mg.genre_id = g.id 
                WHERE mg.movie_id = m.id),
               '[]'::json
             ) AS genres
             FROM movies m
             WHERE m.title ILIKE '%' || $1 || '%' 
             ORDER BY m.popularity DESC NULLS LAST
             limit 50`,
      values: [keyword.trim()],
    };

    const { rows } = await db.query(query);

    res.status(200).json({
      result: {
        status: "ok",
        message: "Search completed successfully",
      },
      data: rows,
      total: rows.length,
    });
  } catch (error) {
    console.log("Error when searching movies", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.logSearch = async (req, res) => {
  try {
    console.log("req.body", req.body);

    const { keyword } = req.body; // Lấy keyword từ req.body
    const userId = req.user.id; // Get from middleware 'protect'

    if (!keyword || keyword.trim() === "") {
      return res.status(400).json({ message: "Missing search keyword!" });
    }

    const query = {
      text: `INSERT INTO search_history (user_id, keyword)
                   VALUES ($1, $2)`,
      values: [userId, keyword.trim()],
    };

    await db.query(query);

    res.status(201).json({
      result: {
        status: "ok",
        message: "Search logged successfully",
      },
    });
  } catch (error) {
    console.log("Error when log search", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
