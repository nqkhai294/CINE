const db = require("../db");
const {
  getUserRatingInteractions,
  rerankSearchWithMl,
} = require("../utils/searchRerank");

const MAX_GENRE_PERSONALIZED_POOL = 500;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

async function getGenreMovieTotal(genreId, keyword) {
  const kw = keyword && String(keyword).trim();
  if (kw) {
    const { rows } = await db.query(
      `SELECT COUNT(DISTINCT m.id)::int AS total
       FROM movies m
       INNER JOIN movie_genres mg ON m.id = mg.movie_id
       WHERE mg.genre_id = $1 AND m.title ILIKE '%' || $2 || '%'`,
      [genreId, kw],
    );
    return rows[0].total;
  }
  const { rows } = await db.query(
    `SELECT COUNT(DISTINCT m.id)::int AS total
     FROM movies m
     INNER JOIN movie_genres mg ON m.id = mg.movie_id
     WHERE mg.genre_id = $1`,
    [genreId],
  );
  return rows[0].total;
}

async function fetchGenrePoolIds(genreId, keyword, poolLimit) {
  const kw = keyword && String(keyword).trim();
  if (kw) {
    const { rows } = await db.query(
      `SELECT m.id FROM movies m
       INNER JOIN movie_genres mg ON m.id = mg.movie_id
       WHERE mg.genre_id = $1 AND m.title ILIKE '%' || $2 || '%'
       ORDER BY m.release_date DESC NULLS LAST
       LIMIT $3`,
      [genreId, kw, poolLimit],
    );
    return rows.map((r) => Number(r.id));
  }
  const { rows } = await db.query(
    `SELECT m.id FROM movies m
     INNER JOIN movie_genres mg ON m.id = mg.movie_id
     WHERE mg.genre_id = $1
     ORDER BY m.release_date DESC NULLS LAST
     LIMIT $2`,
    [genreId, poolLimit],
  );
  return rows.map((r) => Number(r.id));
}

async function fetchGenreMoviesByIdsOrdered(ids) {
  if (!ids.length) return [];
  const { rows } = await db.query(
    `SELECT m.*, COALESCE(ARRAY_AGG(DISTINCT g.name), '{}') AS genres
     FROM movies m
     LEFT JOIN movie_genres mg2 ON m.id = mg2.movie_id
     LEFT JOIN genres g ON mg2.genre_id = g.id
     WHERE m.id = ANY($1::int[])
     GROUP BY m.id
     ORDER BY array_position($2::int[], m.id::int)`,
    [ids, ids],
  );
  return rows;
}

async function fetchGenrePageSql(genreId, keyword, sqlOffset, sqlLimit) {
  if (sqlLimit <= 0) return [];
  const kw = keyword && String(keyword).trim();
  if (kw) {
    const { rows } = await db.query(
      `SELECT m.*, COALESCE(ARRAY_AGG(DISTINCT g.name), '{}') AS genres
       FROM movies m
       INNER JOIN movie_genres mg ON m.id = mg.movie_id
       LEFT JOIN movie_genres mg2 ON m.id = mg2.movie_id
       LEFT JOIN genres g ON mg2.genre_id = g.id
       WHERE mg.genre_id = $1 AND m.title ILIKE '%' || $2 || '%'
       GROUP BY m.id
       ORDER BY m.release_date DESC NULLS LAST
       OFFSET $3 LIMIT $4`,
      [genreId, kw, sqlOffset, sqlLimit],
    );
    return rows;
  }
  const { rows } = await db.query(
    `SELECT m.*, COALESCE(ARRAY_AGG(DISTINCT g.name), '{}') AS genres
     FROM movies m
     INNER JOIN movie_genres mg ON m.id = mg.movie_id
     LEFT JOIN movie_genres mg2 ON m.id = mg2.movie_id
     LEFT JOIN genres g ON mg2.genre_id = g.id
     WHERE mg.genre_id = $1
     GROUP BY m.id
     ORDER BY m.release_date DESC NULLS LAST
     OFFSET $2 LIMIT $3`,
    [genreId, sqlOffset, sqlLimit],
  );
  return rows;
}

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

/**
 * GET /api/genres/:id/movies
 * Query: page, limit, keyword (lọc title trong thể loại, tùy chọn).
 * optionalProtect: JWT + rating → rerank pool 500 theo profile, đuôi theo release_date.
 */
module.exports.getAllMoviesByGenre = async (req, res) => {
  try {
    const genreId = req.params.id;
    const keyword = (req.query.keyword || "").trim();
    const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
    let limit = parseInt(String(req.query.limit), 10) || DEFAULT_LIMIT;
    limit = Math.min(MAX_LIMIT, Math.max(1, limit));
    const offset = (page - 1) * limit;

    const genreResult = await db.query(
      "SELECT id, name FROM genres WHERE id = $1",
      [genreId],
    );

    if (genreResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Genre not found",
      });
    }

    const total = await getGenreMovieTotal(
      genreId,
      keyword || undefined,
    );
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    let movies = [];
    let personalized = false;

    if (total === 0) {
      movies = [];
    } else if (req.user) {
      const interactions = await getUserRatingInteractions(req.user.id);
      if (interactions.length > 0) {
        const poolIds = await fetchGenrePoolIds(
          genreId,
          keyword || undefined,
          MAX_GENRE_PERSONALIZED_POOL,
        );
        const M = poolIds.length;

        if (M === 0) {
          movies = [];
        } else {
          const mlOrder = await rerankSearchWithMl(interactions, poolIds);
          const rankedIds = mlOrder || poolIds;
          personalized = Boolean(mlOrder);

          const start = offset;
          const end = Math.min(start + limit, total);

          if (start >= total) {
            movies = [];
          } else if (end <= M) {
            movies = await fetchGenreMoviesByIdsOrdered(
              rankedIds.slice(start, end),
            );
          } else if (start >= M) {
            movies = await fetchGenrePageSql(
              genreId,
              keyword || undefined,
              start,
              end - start,
            );
          } else {
            const headRows = await fetchGenreMoviesByIdsOrdered(
              rankedIds.slice(start, M),
            );
            const tailRows = await fetchGenrePageSql(
              genreId,
              keyword || undefined,
              M,
              end - M,
            );
            movies = [...headRows, ...tailRows];
          }
        }
      } else {
        movies = await fetchGenrePageSql(
          genreId,
          keyword || undefined,
          offset,
          limit,
        );
      }
    } else {
      movies = await fetchGenrePageSql(
        genreId,
        keyword || undefined,
        offset,
        limit,
      );
    }

    res.status(200).json({
      success: true,
      genre: genreResult.rows[0],
      movies,
      count: movies.length,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      personalized,
    });
  } catch (error) {
    console.log("Lỗi khi lấy danh sách phim theo thể loại:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};
