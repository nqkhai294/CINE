const express = require("express");
const router = express.Router();
const directorController = require("../controllers/directorController");

// GET /api/directors - Lấy tất cả directors
router.get("/", directorController.getAllDirectors);

// GET /api/directors/:directorId/movies - Lấy phim theo director ID
router.get("/:directorId/movies", directorController.getMoviesByDirector);

module.exports = router;
