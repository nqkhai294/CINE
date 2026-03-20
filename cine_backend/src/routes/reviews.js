// src/routes/reviews.js
const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware"); // Import "người gác cổng"

// POST /api/reviews/
// Thêm/sửa một bình luận (Cần đăng nhập)
router.post("/", protect, reviewController.addReview);

// GET /api/reviews/movie/:movieId
// Lấy tất cả bình luận của 1 phim (Không cần đăng nhập)
router.get("/movie/:movieId", reviewController.getReviewsForMovie);

// GET /api/reviews/user/:userId
// Lấy tất cả bình luận của 1 user (Không cần đăng nhập)
router.get("/user/:userId", reviewController.getReviewsFromUser);

module.exports = router;
