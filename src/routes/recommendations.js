// src/routes/recommendations.js
const express = require("express");
const router = express.Router();
const recommendationController = require("../controllers/recommendationController");

router.get(
  "/similar/:movieId",
  // Sửa 'getSimilarByGenre' thành:
  recommendationController.getSimilarMovies
);

module.exports = router;
