const express = require("express");
const router = express.Router();

const searchController = require("../controllers/searchController");
const { protect } = require("../middleware/authMiddleware");

// API POST: Log search history (cần đăng nhập)
router.post("/", protect, searchController.logSearch);

module.exports = router;
