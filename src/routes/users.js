const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

/**
 * API: GET /api/users/:userId
 * Mô tả: Lấy thông tin profile của user theo ID
 */
router.get("/:userId", userController.getUserById);

/**
 * API: PUT /api/users/profile
 * Mô tả: Cập nhật profile của user hiện tại (cần đăng nhập)
 */
router.put("/profile", protect, userController.updateUserProfile);

/**
 * API: GET /api/users/me
 * Mô tả: Lấy thông tin profile của user hiện tại (cần đăng nhập)
 */
router.get("/me", protect, async (req, res) => {
  // Redirect to getUserById với user hiện tại
  req.params.userId = req.user.id;
  return userController.getUserById(req, res);
});

module.exports = router;
