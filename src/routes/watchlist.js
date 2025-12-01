const express = require("express");
const router = express.Router();

const watchlistController = require("../controllers/watchlistController");
const { protect } = require("../middleware/authMiddleware");

/**
 * API: POST /api/watchlist
 * Mô tả: Thêm phim vào watchlist (cần đăng nhập)
 */
router.post("/", protect, watchlistController.addToWatchlist);

/**
 * API: GET /api/watchlist
 * Mô tả: Lấy danh sách watchlist của user hiện tại (cần đăng nhập)
 */
router.get("/", protect, watchlistController.getWatchlist);

/**
 * API: GET /api/watchlist/count
 * Mô tả: Lấy số lượng phim trong watchlist (cần đăng nhập)
 */
router.get("/count", protect, watchlistController.getWatchlistCount);

/**
 * API: GET /api/watchlist/check/:movieId
 * Mô tả: Kiểm tra phim có trong watchlist không (cần đăng nhập)
 */
router.get("/check/:movieId", protect, watchlistController.checkInWatchlist);

/**
 * API: DELETE /api/watchlist/:movieId
 * Mô tả: Xóa phim khỏi watchlist (cần đăng nhập)
 */
router.delete("/:movieId", protect, watchlistController.removeFromWatchlist);

module.exports = router;
