// src/routes/recommendations.js
const express = require("express");
const router = express.Router();
const { protect, optionalProtect } = require("../middleware/authMiddleware");

const recommendationController = require("../controllers/recommendationController");

router.get(
  "/similar/:movieId",
  optionalProtect,
  recommendationController.getSimilarMovies,
);

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

router.get(
  "/similar-users-watch",
  protect,
  recommendationController.getSimilarUsersWatchRecommendations,
);

module.exports = router;
