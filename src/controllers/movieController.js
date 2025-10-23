const db = require("../db");

module.exports.getAllMovies = async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT id, title, poster_url, avg_rating FROM movies ORDER BY release_year DESC"
    );
    res.status(200).json({
      result: {
        message: "success",
        status: "ok",
      },
      data: rows,
      total: rows.length,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phim:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports.getMovieById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get movie details
    const movieQuery = {
      text: `SELECT * FROM movies WHERE id = $1`,
      values: [id],
    };

    const movieResult = await db.query(movieQuery);

    if (movieResult.rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy phim" });
    }
    const movie = movieResult.rows[0];

    // Get movie genres
    const genreQuery = {
      text: `SELECT G.name FROM genres G JOIN movie_genres MG ON G.id = MG.genre_id
                   WHERE MG.movie_id = $1`,
      values: [id],
    };
    const genreResult = await db.query(genreQuery);
    movie.genres = genreResult.rows.map((g) => g.name);

    // Get actors, directors, ...

    res.status(200).json({
      result: {
        message: "success",
        status: "ok",
      },
      data: movie,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
