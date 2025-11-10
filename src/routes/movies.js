const express = require("express");
const router = express.Router();

const movieController = require("../controllers/movieController");

/**
 * API: GET /api/movies
 * Mô tả: Lấy danh sách tất cả phim
 */

router.get("/", movieController.getAllMovies);

/**
 * API: GET /api/movies/six-newest-movies
 */
router.get("/highest-rate", movieController.getHighestTMDBMovies);

/**
 * API: GET /api/movies/newest-movies
 */
router.get("/newest", movieController.getTenNewestMovies);

/**
 * API: GET /api/movies/:id
 * Mô tả: Lấy chi tiết phim theo ID
 */

router.get("/:id", movieController.getMovieById);

/**
 * API: GET /api/movies/search?{key}
 * Mô tả: Lấy chi tiết phim theo ID
 */

router.get("/search/:key", movieController.getMovieById);

module.exports = router;
