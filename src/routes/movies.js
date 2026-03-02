const express = require("express");
const router = express.Router();

const movieController = require("../controllers/movieController");
const searchController = require("../controllers/searchController");

/**
 * API: GET /api/movies
 * Mô tả: Lấy danh sách tất cả phim
 */

router.get("/", movieController.getAllMovies);

/**
 * API: GET /api/movies/search?keyword=xyz
 * Mô tả: Tìm kiếm phim theo từ khóa
 */
router.get("/search", searchController.searchMovies);

/**
 * API: GET /api/movies/highest-rate
 */
router.get("/highest-rate", movieController.getHighestTMDBMovies);

/**
 * API: GET /api/movies/newest
 */
router.get("/newest", movieController.getTenNewestMovies);

router.get("/genre/:id", movieController.getGenresRecommendationsForUser);

/**
 * API: GET /api/movies/:id
 * Mô tả: Lấy chi tiết phim theo ID
 * LƯU Ý: Route này phải để cuối cùng vì /:id sẽ match mọi thứ
 */
router.get("/:id", movieController.getMovieById);

module.exports = router;
