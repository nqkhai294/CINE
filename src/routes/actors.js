const express = require("express");
const router = express.Router();
const actorController = require("../controllers/actorController");

// GET /api/actors - Lấy tất cả actors
router.get("/", actorController.getAllActors);

// GET /api/actors/:actorId/movies - Lấy phim theo actor ID
router.get("/:actorId/movies", actorController.getMoviesByActor);

module.exports = router;
