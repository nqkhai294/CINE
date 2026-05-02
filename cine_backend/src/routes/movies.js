const express = require("express");
const router = express.Router();
const { protect, optionalProtect } = require("../middleware/authMiddleware");

const movieController = require("../controllers/movieController");
const searchController = require("../controllers/searchController");

/**
 * API: GET /api/movies
 * Query: page, limit, keyword (tùy chọn). optionalProtect + JWT + rating → rerank pool 500 (có hoặc không keyword).
 * Response: { data, pagination, personalized }
 */

router.get("/", optionalProtect, movieController.getAllMovies);

/**
 * API: GET /api/movies/search?keyword=&page=&limit=
 * Phân trang; có JWT + rating → rerank global trong pool 200.
 */
router.get("/search", optionalProtect, searchController.searchMovies);

/**
 * API: GET /api/movies/highest-rate
 */
router.get("/highest-rate", movieController.getHighestTMDBMovies);

/**
 * API: GET /api/movies/newest
 */
router.get("/newest", movieController.getTenNewestMovies);

router.get("/genre/:id", movieController.getGenresRecommendationsForUser);

router.get("/progressing", protect, movieController.getMovieProgressingForUser);

/**
 * API: GET /api/movies/:id
 * Mô tả: Lấy chi tiết phim theo ID
 * LƯU Ý: Route này phải để cuối cùng vì /:id sẽ match mọi thứ
 */
router.get("/:id", movieController.getMovieById);

module.exports = router;
