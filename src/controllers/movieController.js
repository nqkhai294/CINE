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
      text: `SELECT 
          m.*, 
          
          -- Ép kiểu các cột số về FLOAT cho chuẩn JSON
          m.popularity::FLOAT,
          m.tmdb_vote_average::FLOAT,
          m.avg_rating::FLOAT,
          
          
          COALESCE(
            (SELECT JSON_AGG(g.name) 
             FROM Movie_Genres mg 
             JOIN Genres g ON mg.genre_id = g.id 
             WHERE mg.movie_id = m.id),
            '[]'::json
          ) AS genres,
          
          
          COALESCE(
            (SELECT JSON_AGG(
              json_build_object(
                'id', a.id, 
                'name', a.name, 
                'profile_url', a.profile_url
              )
            ) 
             FROM Movie_Actors ma 
             JOIN Actors a ON ma.actor_id = a.id 
             WHERE ma.movie_id = m.id),
            '[]'::json
          ) AS actors,
          
          
          COALESCE(
            (SELECT JSON_AGG(
              json_build_object(
                'id', d.id, 
                'name', d.name, 
                'profile_url', d.profile_url
              )
            ) 
             FROM Movie_Directors md 
             JOIN Directors d ON md.director_id = d.id 
             WHERE md.movie_id = m.id),
            '[]'::json
          ) AS directors
          
        FROM Movies m
        WHERE m.id = $1;`,
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

module.exports.getHighestTMDBMovies = async (req, res) => {
  try {
    // Join 3 table để lấy cả thể loại
    const query = {
      text: `SELECT 
          m.*, 
          COALESCE(ARRAY_AGG(g.name), '{}') AS genres
        FROM Movies m
        LEFT JOIN Movie_Genres mg ON m.id = mg.movie_id
        LEFT JOIN Genres g ON mg.genre_id = g.id
		    where tmdb_vote_count > 20000
        GROUP BY m.id
        ORDER BY m.tmdb_vote_average DESC NULLS LAST
        LIMIT 6`,
    };

    const { rows } = await db.query(query);
    res.status(200).json({
      result: {
        message: "success",
        status: "ok",
      },
      data: rows,
      total: rows.length,
    });
  } catch (error) {
    console.error("Lỗi khi lấy 6 phim mới nhất:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports.getTenNewestMovies = async (req, res) => {
  try {
    const query = {
      text: `SELECT 
          m.*, 
          COALESCE(ARRAY_AGG(g.name), '{}') AS genres
        FROM Movies m
        LEFT JOIN Movie_Genres mg ON m.id = mg.movie_id
        LEFT JOIN Genres g ON mg.genre_id = g.id
        GROUP BY m.id
        ORDER BY m.release_date DESC NULLS LAST
        LIMIT 10`,
    };

    const { rows } = await db.query(query);
    res.status(200).json({
      result: {
        message: "success",
        status: "ok",
      },
      data: rows,
      total: rows.length,
    });
  } catch (error) {
    console.error("Lỗi khi lấy 10 phim mới nhất:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
