const express = require("express");
const router = express.Router();
const { protect, optionalProtect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

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

/**
 * API: GET /api/movies/trending-rated — phim được chấm cao gần đây (public)
 */
router.get("/trending-rated", movieController.getTrendingGoodRatedMovies);

router.get("/genre/:id", movieController.getGenresRecommendationsForUser);

router.get("/progressing", protect, movieController.getMovieProgressingForUser);

/**
 * GET /api/movies/admin/all
 * Lấy danh sách phim
 * Query params: page, limit, search
 */
router.get("/admin/all", protect, adminOnly, movieController.getAllMoviesAdmin);

/**
 * PUT /api/movies/admin/:movieId
 * Cập nhật thông tin phim
 */
router.put(
  "/admin/:movieId",
  protect,
  adminOnly,
  movieController.updateMovieAdmin,
);

/**
 * DELETE /api/movies/admin/:movieId
 * Xóa phim
 */
router.delete(
  "/admin/:movieId",
  protect,
  adminOnly,
  movieController.deleteMovieAdmin,
);

/**
 * API: GET /api/movies/:id
 * Mô tả: Lấy chi tiết phim theo ID
 */
router.get("/:id", movieController.getMovieById);

module.exports = router;
