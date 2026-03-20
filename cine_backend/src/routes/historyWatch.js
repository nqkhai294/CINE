const express = require("express");
const router = express.Router();

const historyWatchController = require("../controllers/historyWatchController");

const { protect } = require("../middleware/authMiddleware");

// api called when a user views a movie
router.post("/", protect, historyWatchController.logView);

router.get("/", protect, historyWatchController.getUserViews);

module.exports = router;
