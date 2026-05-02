const db = require("../db");
const {
  getUserRatingInteractions,
  rerankSearchWithMl,
} = require("../utils/searchRerank");

const MAX_PERSONALIZED_POOL = 500;

async function fetchMoviesByIdsOrdered(ids) {
  if (!ids.length) return [];
  const { rows } = await db.query(
    `SELECT m.id, m.title, m.poster_url, m.avg_rating
     FROM movies m
     WHERE m.id = ANY($1::int[])
     ORDER BY array_position($2::int[], m.id::int)`,
    [ids, ids],
  );
  return rows;
}

async function fetchKeywordPageSql(keyword, sqlOffset, sqlLimit) {
  if (sqlLimit <= 0) return [];
  const { rows } = await db.query(
    `SELECT m.id, m.title, m.poster_url, m.avg_rating
     FROM movies m
     WHERE m.title ILIKE '%' || $1 || '%'
     ORDER BY m.release_year DESC NULLS LAST
     OFFSET $2 LIMIT $3`,
    [keyword, sqlOffset, sqlLimit],
  );
  return rows;
}

async function fetchAllMoviesPageSql(sqlOffset, sqlLimit) {
  if (sqlLimit <= 0) return [];
  const { rows } = await db.query(
    `SELECT m.id, m.title, m.poster_url, m.avg_rating
     FROM movies m
     ORDER BY m.release_year DESC NULLS LAST
     OFFSET $1 LIMIT $2`,
    [sqlOffset, sqlLimit],
  );
  return rows;
}

/**
 * GET /api/movies
 * Query: page, limit, keyword (tùy chọn).
 * Có JWT + có rating: rerank global trên pool tối đa MAX_PERSONALIZED_POOL
 */
module.exports.getAllMovies = async (req, res) => {
  try {
    const keyword = (req.query.keyword || "").trim();
    const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
    let limit = parseInt(String(req.query.limit), 10) || 20;
    limit = Math.min(100, Math.max(1, limit));
    const offset = (page - 1) * limit;

    const whereClause = keyword ? `WHERE m.title ILIKE '%' || $1 || '%'` : "";

    const countSql = `SELECT COUNT(*)::int AS total FROM movies m ${whereClause}`;
    const countParams = keyword ? [keyword] : [];
    const { rows: countRows } = await db.query(countSql, countParams);
    const total = countRows[0].total;

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    let data = [];
    let personalized = false;

    if (!keyword) {
      if (req.user) {
        const interactions = await getUserRatingInteractions(req.user.id);
        if (interactions.length > 0) {
          const { rows: poolRows } = await db.query(
            `SELECT m.id FROM movies m ORDER BY m.release_year DESC NULLS LAST LIMIT $1`,
            [MAX_PERSONALIZED_POOL],
          );
          const poolIds = poolRows.map((r) => Number(r.id));
          const M = poolIds.length;

          if (M === 0) {
            data = [];
          } else {
            const mlOrder = await rerankSearchWithMl(interactions, poolIds);
            const rankedIds = mlOrder || poolIds;
            personalized = Boolean(mlOrder);

            const start = offset;
            const end = Math.min(start + limit, total);

            if (start >= total) {
              data = [];
            } else if (end <= M) {
              data = await fetchMoviesByIdsOrdered(rankedIds.slice(start, end));
            } else if (start >= M) {
              data = await fetchAllMoviesPageSql(start, end - start);
            } else {
              const idsHead = rankedIds.slice(start, M);
              const headRows = await fetchMoviesByIdsOrdered(idsHead);
              const tailRows = await fetchAllMoviesPageSql(M, end - M);
              data = [...headRows, ...tailRows];
            }
          }
        } else {
          const dataSql = `SELECT id, title, poster_url, avg_rating FROM movies m ORDER BY m.release_year DESC NULLS LAST LIMIT $1 OFFSET $2`;
          const { rows } = await db.query(dataSql, [limit, offset]);
          data = rows;
        }
      } else {
        const dataSql = `SELECT id, title, poster_url, avg_rating FROM movies m ORDER BY m.release_year DESC NULLS LAST LIMIT $1 OFFSET $2`;
        const { rows } = await db.query(dataSql, [limit, offset]);
        data = rows;
      }
    } else if (req.user) {
      const interactions = await getUserRatingInteractions(req.user.id);
      if (interactions.length > 0) {
        const { rows: poolRows } = await db.query(
          `SELECT m.id FROM movies m WHERE m.title ILIKE '%' || $1 || '%' ORDER BY m.release_year DESC NULLS LAST LIMIT $2`,
          [keyword, MAX_PERSONALIZED_POOL],
        );
        const poolIds = poolRows.map((r) => Number(r.id));
        const M = poolIds.length;

        if (M === 0) {
          data = [];
        } else {
          const mlOrder = await rerankSearchWithMl(interactions, poolIds);
          const rankedIds = mlOrder || poolIds;
          personalized = Boolean(mlOrder);

          const start = offset;
          const end = Math.min(start + limit, total);

          if (start >= total) {
            data = [];
          } else if (end <= M) {
            data = await fetchMoviesByIdsOrdered(rankedIds.slice(start, end));
          } else if (start >= M) {
            data = await fetchKeywordPageSql(keyword, start, end - start);
          } else {
            const idsHead = rankedIds.slice(start, M);
            const headRows = await fetchMoviesByIdsOrdered(idsHead);
            const tailRows = await fetchKeywordPageSql(keyword, M, end - M);
            data = [...headRows, ...tailRows];
          }
        }
      } else {
        const dataSql = `SELECT id, title, poster_url, avg_rating FROM movies m ${whereClause} ORDER BY m.release_year DESC NULLS LAST LIMIT $2 OFFSET $3`;
        const { rows } = await db.query(dataSql, [keyword, limit, offset]);
        data = rows;
      }
    } else {
      const dataSql = `SELECT id, title, poster_url, avg_rating FROM movies m ${whereClause} ORDER BY m.release_year DESC NULLS LAST LIMIT $2 OFFSET $3`;
      const { rows } = await db.query(dataSql, [keyword, limit, offset]);
      data = rows;
    }

    res.status(200).json({
      result: {
        message: "success",
        status: "ok",
      },
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      personalized,
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
    const query = {
      text: `select m.*, coalesce(array_agg(g.name), '{}') as genres
             from movies m
             left join movie_genres mg on m.id = mg.movie_id
             left join genres g on mg.genre_id = g.id
             where tmdb_vote_count > 100
             group by m.id
             order by release_date desc nulls last
             limit 6;`,
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

module.exports.getTrendingGoodRatedMovies = async (req, res) => {
  try {
    const query = {
      text: `SELECT m.*, COALESCE(ARRAY_AGG(DISTINCT g.name), '{}') AS genres
             FROM movies m
             LEFT JOIN movie_genres mg ON m.id = mg.movie_id
             LEFT JOIN genres g ON mg.genre_id = g.id
             WHERE m.release_year IS NOT NULL
               AND m.release_year >= EXTRACT(YEAR FROM CURRENT_DATE) - 5
               AND m.tmdb_vote_average IS NOT NULL
               AND m.tmdb_vote_average >= 7
               AND COALESCE(m.tmdb_vote_count, 0) >= 50
             GROUP BY m.id
             ORDER BY m.tmdb_vote_average DESC NULLS LAST,
                      m.release_year DESC NULLS LAST,
                      m.release_date DESC NULLS LAST
             LIMIT 10`,
    };

    const { rows } = await db.query(query);

    res.status(200).json({
      result: { message: "success", status: "ok" },
      data: rows,
      total: rows.length,
    });
  } catch (error) {
    console.error("Lỗi khi lấy phim xu hướng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports.getGenresRecommendationsForUser = async (req, res) => {
  try {
    const genreId = req.params.id;
    const query = {
      text: `select m.*, coalesce(array_agg(g.name), '{}') as genres
             from movies m
             left join movie_genres mg on m.id = mg.movie_id
             left join genres g on mg.genre_id = g.id
             where g.id = $1
             group by m.id
             limit 10;`,
      values: [genreId],
    };
    const { rows } = await db.query(query);
    res.status(200).json({
      result: {
        message: "success",
        status: "ok",
      },
      data: rows,
    });
  } catch (error) {
    console.error("Error in getGenresRecommendationsForUser:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports.getMovieProgressingForUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const query = {
      text: `select m.id as movie_id, m.title, m.backdrop_url, 
             uwp.progress_seconds, uwp.duration, uwp.updated_at
             from user_watch_progress uwp
             join movies m on uwp.movie_id = m.id
             where uwp.user_id = $1 and uwp.progress_seconds > 0 and (uwp.progress_seconds / NULLIF(uwp.duration, 0)) < 0.95
             group by m.id, m.title, m.backdrop_url, uwp.progress_seconds, uwp.duration, uwp.updated_at
             order by uwp.updated_at desc;`,
      values: [userId],
    };

    const { rows } = await db.query(query);
    res.status(200).json({
      result: {
        message: "success",
        status: "ok",
      },
      data: rows,
    });
  } catch (error) {
    console.error("Error in getMovieProgressingForUser:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
