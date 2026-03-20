const db = require("../db");

module.exports.getAllActors = async (req, res) => {
  try {
    const query = {
      text: "SELECT id, name, profile_url FROM actors ORDER BY name ASC",
    };

    const result = await db.query(query);

    res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error("Error getting all actors:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve actors",
    });
  }
};

module.exports.getMoviesByActor = async (req, res) => {
  try {
    const actorId = req.params.actorId;

    // Lấy thông tin actor
    const actorQuery = {
      text: "SELECT id, name, profile_url FROM actors WHERE id = $1",
      values: [actorId],
    };
    const actorResult = await db.query(actorQuery);

    if (actorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Actor not found",
      });
    }

    // Lấy tất cả phim của actor này
    const moviesQuery = {
      text: `SELECT m.*, 
          COALESCE(ARRAY_AGG(DISTINCT g.name), '{}') AS genres
          FROM movies m
          INNER JOIN movie_actors ma ON m.id = ma.movie_id
          LEFT JOIN movie_genres mg ON m.id = mg.movie_id
          LEFT JOIN genres g ON mg.genre_id = g.id
          WHERE ma.actor_id = $1
          GROUP BY m.id
          ORDER BY m.release_date DESC`,
      values: [actorId],
    };
    const moviesResult = await db.query(moviesQuery);

    res.status(200).json({
      success: true,
      actor: actorResult.rows[0],
      movies: moviesResult.rows,
      count: moviesResult.rows.length,
    });
  } catch (error) {
    console.error("Error getting movies by actor:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve movies",
    });
  }
};
