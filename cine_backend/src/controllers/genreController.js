const db = require("../db");

module.exports.getAllGenres = async (req, res) => {
  try {
    const query = {
      text: "SELECT id, name FROM genres ORDER BY name ASC",
    };

    const result = await db.query(query);

    res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error("Error getting all genres:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve genres",
    });
  }
};

module.exports.getAllMoviesByGenre = async (req, res) => {
  try {
    const genreId = req.params.id;

    // Kiểm tra genre có tồn tại không
    const genreQuery = {
      text: "SELECT id, name FROM genres WHERE id = $1",
      values: [genreId],
    };
    const genreResult = await db.query(genreQuery);

    if (genreResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Genre not found",
      });
    }

    const query = {
      text: `SELECT m.*, 
          COALESCE(ARRAY_AGG(DISTINCT g.name), '{}') AS genres
          FROM movies m
          INNER JOIN movie_genres mg ON m.id = mg.movie_id
          LEFT JOIN movie_genres mg2 ON m.id = mg2.movie_id
          LEFT JOIN genres g ON mg2.genre_id = g.id
          WHERE mg.genre_id = $1
          GROUP BY m.id
          ORDER BY m.release_date DESC`,
      values: [genreId],
    };
    const { rows } = await db.query(query);

    res.status(200).json({
      success: true,
      genre: genreResult.rows[0],
      movies: rows,
      count: rows.length,
    });
  } catch (error) {
    console.log("Lỗi khi lấy danh sách phim theo thể loại:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};
