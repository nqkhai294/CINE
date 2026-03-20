const express = require("express");
const router = express.Router();

const genreController = require("../controllers/genreController");

/**
 * API: GET /api/genres
 * Mô tả: Lấy danh sách tất cả thể loại phim
 */
router.get("/", genreController.getAllGenres);

/**
 * API: GET /api/genres/:id/movies
 * Mô tả: Lấy danh sách phim theo thể loại
 */
router.get("/:id/movies", genreController.getAllMoviesByGenre);

module.exports = router;
