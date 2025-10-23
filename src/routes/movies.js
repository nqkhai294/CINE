const express = require("express");
const router = express.Router();

const movieController = require("../controllers/movieController");

/**
 * API: GET /api/movies
 * Mô tả: Lấy danh sách tất cả phim
 */

router.get("/", movieController.getAllMovies);

/**
 * API: GET /api/movies/:id
 * Mô tả: Lấy chi tiết phim theo ID
 */

router.get("/:id", movieController.getMovieById);

module.exports = router;
