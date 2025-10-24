const express = require("express");
const router = express.Router();

const searchController = require("../controllers/searchController");
const { protect } = require("../middleware/authMiddleware");

// API called when a user performs a search
router.post("/", protect, searchController.logSearch);

module.exports = router;
