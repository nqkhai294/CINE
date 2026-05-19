const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const watchProgressController = require("../controllers/watchProgressController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

/**
 * API: GET /api/users/me/watch-progress?movie_id=...
 * Lấy tiến độ + cấu hình xem cho một phim (cần đăng nhập)
 */
router.get(
  "/me/watch-progress",
  protect,
  watchProgressController.getWatchProgress,
);

/**
 * API: PUT/PATCH /api/users/me/watch-progress
 * Body: { movie_id, current_time?, duration?, playback_rate?, quality?, subtitle_lang?, subtitle_enabled?, skip_intro? }
 * Upsert tiến độ + cấu hình xem (cần đăng nhập)
 */
router.put(
  "/me/watch-progress",
  protect,
  watchProgressController.upsertWatchProgress,
);
router.patch(
  "/me/watch-progress",
  protect,
  watchProgressController.upsertWatchProgress,
);

/**
 * API: GET /api/users/:userId
 * Mô tả: Lấy thông tin profile của user theo ID
 */
// router.get("/:userId", userController.getUserById);

/**
 * API: PUT /api/users/profile
 * Mô tả: Cập nhật profile của user hiện tại (cần đăng nhập)
 */
router.put("/profile", protect, userController.updateUserProfile);

/**
 * API: PUT /api/users/avatar
 * Mô tả: Cập nhật avatar của user hiện tại (cần đăng nhập)
 */
router.put("/avatar", protect, userController.updateUserAvatar);

/**
 * GET /api/users/admin/all
 * Lấy danh sách tất cả người dùng
 */
router.get("/admin/all", protect, adminOnly, userController.getAllUsers);

/**
 * PUT /api/users/admin/:userId
 * Cập nhật thông tin người dùng
 */
router.put(
  "/admin/:userId",
  protect,
  adminOnly,
  userController.adminUpdateUser,
);

/**
 * PUT /api/users/admin/:userId/role
 * Cập nhật role của người dùng
 */
router.put(
  "/admin/:userId/role",
  protect,
  adminOnly,
  userController.updateUserRole,
);

/**
 * DELETE /api/users/admin/:userId
 * Xóa người dùng
router.delete("/admin/:userId", protect, adminOnly, userController.deleteUser);

/**
 * API: GET /api/users/:id
 * Mô tả: Lấy thông tin profile của user hiện tại (cần đăng nhập)
 */
router.get("/:id", protect, async (req, res) => {
  // Redirect to getUserById với user hiện tại
  req.params.userId = req.user.id;
  return userController.getUserById(req, res);
});

module.exports = router;
