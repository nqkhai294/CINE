const db = require("../db");

module.exports.getAllDirectors = async (req, res) => {
  try {
    const query = {
      text: "SELECT id, name, profile_url FROM directors ORDER BY name ASC",
    };

    const result = await db.query(query);

    res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error("Error getting all directors:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve directors",
    });
  }
};

module.exports.getMoviesByDirector = async (req, res) => {
  try {
    const directorId = req.params.directorId;

    // Lấy thông tin director
    const directorQuery = {
      text: "SELECT id, name, profile_url FROM directors WHERE id = $1",
      values: [directorId],
    };
    const directorResult = await db.query(directorQuery);

    if (directorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Director not found",
      });
    }

    // Lấy tất cả phim của director này
    const moviesQuery = {
      text: `SELECT m.*, 
          COALESCE(ARRAY_AGG(DISTINCT g.name), '{}') AS genres
          FROM movies m
          INNER JOIN movie_directors md ON m.id = md.movie_id
          LEFT JOIN movie_genres mg ON m.id = mg.movie_id
          LEFT JOIN genres g ON mg.genre_id = g.id
          WHERE md.director_id = $1
          GROUP BY m.id
          ORDER BY m.release_date DESC`,
      values: [directorId],
    };
    const moviesResult = await db.query(moviesQuery);

    res.status(200).json({
      success: true,
      director: directorResult.rows[0],
      movies: moviesResult.rows,
      count: moviesResult.rows.length,
    });
  } catch (error) {
    console.error("Error getting movies by director:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve movies",
    });
  }
};
