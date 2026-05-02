const db = require("../db");
const axios = require("axios");
const cache = require("../utils/cache");
const URL_ML = require("../environment/environment").URL_ML;

const pendingRequests = new Map();

const FOR_YOU_CB_TOP_N = 15;

/** Giữ thứ tự id sau khi join DB (content-based / sau này blend CF). */
async function hydrateMoviesByIdsOrdered(ids) {
  if (!ids.length) return [];
  const { rows } = await db.query(
    `SELECT m.*, COALESCE(ARRAY_AGG(DISTINCT g.name), '{}') AS genres
     FROM movies m
     LEFT JOIN movie_genres mg ON m.id = mg.movie_id
     LEFT JOIN genres g ON mg.genre_id = g.id
     WHERE m.id = ANY($1::int[])
     GROUP BY m.id`,
    [ids],
  );
  const map = new Map(rows.map((m) => [String(m.id), m]));
  return ids.map((id) => map.get(String(id))).filter(Boolean);
}

async function fetchTrendingMovies(limit = 10) {
  const { rows } = await db.query(
    `SELECT m.*, COALESCE(ARRAY_AGG(DISTINCT g.name), '{}') AS genres
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
     LIMIT $1`,
    [limit],
  );
  return rows;
}

async function fetchNewestMovies(limit = 10) {
  const { rows } = await db.query(
    `SELECT m.*, COALESCE(ARRAY_AGG(DISTINCT g.name), '{}') AS genres
     FROM movies m
     LEFT JOIN movie_genres mg ON m.id = mg.movie_id
     LEFT JOIN genres g ON mg.genre_id = g.id
     GROUP BY m.id
     ORDER BY m.release_date DESC NULLS LAST
     LIMIT $1`,
    [limit],
  );
  return rows;
}

/** Không có rating hoặc CB trả rỗng / lỗi ML: xu hướng → mới nhất. */
async function fetchForYouFallback(limit = 10) {
  let rows = await fetchTrendingMovies(limit);
  let source = "trending";
  if (!rows.length) {
    rows = await fetchNewestMovies(limit);
    source = "newest";
  }
  return { rows, source };
}

/**
 * Tỷ lệ CB trong blend (khi đã có CF). Hiện chưa có CF → luôn dùng full CB.
 * ratingCount > 20 → 40% CB + 60% CF; > 10 → 60% CB + 40% CF; else 100% CB.
 */
function getContentBasedShareForFutureBlend(ratingCount) {
  if (ratingCount > 20) return 0.4;
  if (ratingCount > 10) return 0.6;
  return 1;
}

/**
 * Thể loại gợi ý: cộng điểm từ đánh giá (mạnh) và lượt xem (nhẹ).
 * Không phụ thuộc view DB có thể chưa được tạo (ví dụ v_user_movie_scores).
 */
module.exports.getGenresRecommendationsForUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = {
      text: `WITH genre_scores AS (
          SELECT g.id AS gid,
                 g.name AS gname,
                 SUM(r.rating)::numeric AS s
          FROM ratings r
          INNER JOIN movie_genres mg ON r.movie_id = mg.movie_id
          INNER JOIN genres g ON mg.genre_id = g.id
          WHERE r.user_id = $1
          GROUP BY g.id, g.name
          UNION ALL
          SELECT g.id,
                 g.name,
                 (COUNT(*)::numeric * 0.35) AS s
          FROM views v
          INNER JOIN movie_genres mg ON v.movie_id = mg.movie_id
          INNER JOIN genres g ON mg.genre_id = g.id
          WHERE v.user_id = $1
          GROUP BY g.id, g.name
        )
        SELECT gid AS genre_id,
               gname AS genre_name,
               SUM(s)::float AS total_score
        FROM genre_scores
        GROUP BY gid, gname
        ORDER BY total_score DESC
        LIMIT 12`,
      values: [userId],
    };
    const { rows } = await db.query(query);

    const data = rows.map((row) => ({
      genre_id: String(row.genre_id),
      genre_name: row.genre_name,
      total_score:
        row.total_score != null ? String(row.total_score) : "0",
    }));

    res.status(200).json({
      result: {
        message: "success",
        status: "ok",
      },
      data,
    });
  } catch (error) {
    console.error("Error in getGenresRecommendationsForUser:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/** Item–item từ ML (TF‑IDF). Trang phim dùng /for-you; endpoint này giữ cho API khác. */
module.exports.getSimilarMovies = async (req, res) => {
  try {
    const { movieId } = req.params;
    const cacheKey = `similar_movies_${movieId}`;

    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.status(200).json(cachedData);

    if (pendingRequests.has(cacheKey)) {
      try {
        const data = await pendingRequests.get(cacheKey);
        return res.status(200).json(data);
      } catch (error) {
        return res.status(500).json({ message: "Lỗi đồng bộ" });
      }
    }

    const fetchTask = (async () => {
      let recommendedIds = [];

      try {
        const response = await axios.get(`${URL_ML}/recommend/${movieId}`);
        if (response.data && response.data.status === "ok") {
          recommendedIds = response.data.data;
        }
      } catch (err) {
        console.error("Lỗi Python Service:", err.message);
        return { result: { status: "ok" }, data: [] };
      }

      if (!recommendedIds || recommendedIds.length === 0) {
        return {
          result: { status: "ok", message: "Không tìm thấy phim tương tự" },
          data: [],
        };
      }

      const dbResult = await db.query(
        `SELECT 
            m.*, 
            m.popularity::FLOAT, 
            m.tmdb_vote_average::FLOAT, 
            m.avg_rating::FLOAT, 
            COALESCE(ARRAY_AGG(g.name), '{}') AS genres
         FROM Movies m
         LEFT JOIN Movie_Genres mg ON m.id = mg.movie_id
         LEFT JOIN Genres g ON mg.genre_id = g.id
         WHERE m.id = ANY($1::int[])
         GROUP BY m.id`,
        [recommendedIds],
      );

      const moviesMap = new Map(
        dbResult.rows.map((movie) => [String(movie.id), movie]),
      );

      const sortedMovies = recommendedIds
        .map((id) => moviesMap.get(String(id)))
        .filter((movie) => movie !== undefined);

      const finalResult = {
        result: { status: "ok", message: "Tải phim tương tự thành công" },
        data: sortedMovies,
      };

      cache.set(cacheKey, finalResult);
      return finalResult;
    })();

    pendingRequests.set(cacheKey, fetchTask);

    try {
      const result = await fetchTask;
      return res.status(200).json(result);
    } finally {
      pendingRequests.delete(cacheKey);
    }
  } catch (error) {
    console.error("🔥 Lỗi controller:", error);
    const cacheKey = `similar_movies_${req.params.movieId}`;
    if (pendingRequests.has(cacheKey)) {
      pendingRequests.delete(cacheKey);
    }
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports.getContentBasedRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    const { rows } = await db.query(
      `SELECT movie_id, rating FROM ratings WHERE user_id = $1`,
      [userId],
    );

    const interactions = rows.map((r) => ({
      movie_id: Number(r.movie_id),
      rating: Number(r.rating),
    }));

    const mlRes = await axios.post(`${URL_ML}/recommend/content-based`, {
      user_id: userId,
      top_n: FOR_YOU_CB_TOP_N,
      interactions,
    });

    if (mlRes.data?.status !== "ok" || !Array.isArray(mlRes.data.data)) {
      return res.status(500).json({ message: "Lỗi Python Service" });
    }

    const listId = mlRes.data.data;
    const movies = await hydrateMoviesByIdsOrdered(listId);

    return res.status(200).json({
      result: { status: "ok", message: "success" },
      data: movies,
    });
  } catch (error) {
    console.error("Lỗi CB:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * GET /api/recommendations/for-you (protect)
 * 0 rating → xu hướng / mới nhất; có rating → CB (full; CF blend sau này).
 */
module.exports.getForYouRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    const { rows: countRows } = await db.query(
      `SELECT COUNT(*)::int AS n FROM ratings WHERE user_id = $1`,
      [userId],
    );
    const ratingCount = countRows[0].n;

    if (ratingCount === 0) {
      const { rows, source } = await fetchForYouFallback(10);
      return res.status(200).json({
        result: { status: "ok", message: "success" },
        data: rows,
        meta: {
          source,
          ratingCount,
          blend: "fallback_no_ratings",
          cbSharePlanned: getContentBasedShareForFutureBlend(0),
        },
      });
    }

    const { rows: rRows } = await db.query(
      `SELECT movie_id, rating FROM ratings WHERE user_id = $1`,
      [userId],
    );
    const interactions = rRows.map((r) => ({
      movie_id: Number(r.movie_id),
      rating: Number(r.rating),
    }));

    const cbSharePlanned = getContentBasedShareForFutureBlend(ratingCount);

    let mlRes;
    try {
      mlRes = await axios.post(`${URL_ML}/recommend/content-based`, {
        user_id: userId,
        top_n: FOR_YOU_CB_TOP_N,
        interactions,
      });
    } catch (err) {
      console.error("for-you ML:", err.message);
      mlRes = null;
    }

    const ids =
      mlRes?.data?.status === "ok" && Array.isArray(mlRes.data.data)
        ? mlRes.data.data
        : [];

    if (!ids.length) {
      const { rows, source } = await fetchForYouFallback(10);
      return res.status(200).json({
        result: { status: "ok", message: "success" },
        data: rows,
        meta: {
          source,
          ratingCount,
          blend: "cb_failed_or_empty_fallback",
          cbSharePlanned,
        },
      });
    }

    const movies = await hydrateMoviesByIdsOrdered(ids);

    return res.status(200).json({
      result: { status: "ok", message: "success" },
      data: movies,
      meta: {
        source: "content-based",
        ratingCount,
        blend: "cb_only_cf_pending",
        cbSharePlanned,
      },
    });
  } catch (error) {
    console.error("getForYouRecommendations:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
