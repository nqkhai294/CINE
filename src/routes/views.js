const express = require("express");
const router = express.Router();

const viewController = require("../controllers/viewController");

const { protect } = require("../middleware/authMiddleware");

// api called when a user views a movie
router.post("/", protect, viewController.logView);

module.exports = router;
