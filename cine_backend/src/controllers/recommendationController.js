const db = require("../db");
const axios = require("axios");
const cache = require("../utils/cache");
const URL_ML = require("../environment/environment").URL_ML;

const pendingRequests = new Map();

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

module.exports.getSimilarMovies = async (req, res) => {
  try {
    const { movieId } = req.params;
    const cacheKey = `similar_movies_${movieId}`;

    // 1. Check Cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.status(200).json(cachedData);

    // 2. Promise Locking
    if (pendingRequests.has(cacheKey)) {
      try {
        const data = await pendingRequests.get(cacheKey);
        return res.status(200).json(data);
      } catch (error) {
        return res.status(500).json({ message: "Lỗi đồng bộ" });
      }
    }

    // 3. Xử lý chính
    const fetchTask = (async () => {
      let recommendedIds = [];

      // A. Gọi Python Service
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

      // B. Truy vấn DB
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

      // C. Sắp xếp kết quả
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

      // D. Lưu Cache
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

    const query = {
      text: `select * from ratings where user_id = $1`,
      values: [userId],
    };
    const { rows } = await db.query(query);

    const interactions = rows.map((r) => ({
      movie_id: Number(r.movie_id),
      rating: Number(r.rating),
    }));

    const response = await axios.post(`${URL_ML}/recommend/content-based`, {
      user_id: userId,
      top_n: 15,
      interactions: interactions,
    });

    if (response.data && response.status === "ok") {
      listId = response.data;

      const query = {
        text: `SELECT 
                m.*,
                COALESCE(ARRAY_AGG(g.name), '{}') AS genres
                FROM movies m
                LEFT JOIN movie_genres mg ON m.id = mg.movie_id
                LEFT JOIN genres g ON mg.genre_id = g.id
                WHERE m.id = ANY($1::int[])
                GROUP BY m.id`,
        values: [listId],
      };
      const { rows } = await db.query(query);
      return res.status(200).json(rows);
    } else {
      return res.status(500).json({ message: "Lỗi Python Service" });
    }
  } catch (error) {
    console.error("Lỗi CB:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
