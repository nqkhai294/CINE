// src/routes/recommendations.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const recommendationController = require("../controllers/recommendationController");

router.get("/similar/:movieId", recommendationController.getSimilarMovies);
router.get(
  "/genres",
  protect,
  recommendationController.getGenresRecommendationsForUser,
);

router.get(
  "/for-you",
  protect,
  recommendationController.getForYouRecommendations,
);

module.exports = router;
