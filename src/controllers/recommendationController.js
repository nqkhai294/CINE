const db = require("../db");
const axios = require("axios");
const cache = require("../utils/cache");
const URL_ML = require("../environment/environment").URL_ML;

const pendingRequests = new Map();

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
        // SỬA LỖI 2: Dùng 127.0.0.1 thay vì localhost
        const response = await axios.get(`${URL_ML}/recommend/${movieId}`);
        if (response.data && response.data.status === "ok") {
          recommendedIds = response.data.data;
        }
      } catch (err) {
        console.error("❌ Lỗi Python Service:", err.message);
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
        [recommendedIds]
      );

      // C. Sắp xếp kết quả
      // SỬA LỖI 1: Chuyển ID sang String để Map khớp với DB (vì DB trả về bigint dạng String)
      const moviesMap = new Map(
        dbResult.rows.map((movie) => [String(movie.id), movie])
      );

      const sortedMovies = recommendedIds
        .map((id) => moviesMap.get(String(id))) // Ép kiểu id từ Python sang String luôn
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
