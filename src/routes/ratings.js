const express = require("express");
const router = express.Router();

const ratingController = require("../controllers/ratingController");
const { protect } = require("../middleware/authMiddleware");

// Protect: Login required
router.post("/", protect, ratingController.addOrUpdateRating);

router.get("/movie/:movieId", ratingController.getRatingsForMovie);

router.get("/user/:userId", ratingController.getRatingsFromUser);

module.exports = router;
