const express = require("express");
const router = express.Router();
const favouriteController = require("../controllers/favouriteController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, favouriteController.addToFavourites);

router.get("/", protect, favouriteController.getFavourites);

router.get("/count", protect, favouriteController.getFavouritesCount);

router.get("/check/:movieId", protect, favouriteController.checkInFavourites);

router.delete("/:movieId", protect, favouriteController.removeFromFavourites);

module.exports = router;
