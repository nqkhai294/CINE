// src/server.js
const express = require("express");
const db = require("./db");

const cors = require("cors");
const app = express();
const port = process.env.PORT || 4200;

// Import routes
const movieRoutes = require("./routes/movies");
const authRoutes = require("./routes/auth");
const ratingRoutes = require("./routes/ratings");
const reviewRoutes = require("./routes/reviews");
const viewRoutes = require("./routes/views");
const searchRoutes = require("./routes/search");
const recommendationRoutes = require("./routes/recommendations");
const userRoutes = require("./routes/users");
const watchlistRoutes = require("./routes/watchlist");
const favouriteRoutes = require("./routes/favourites");

const corsOptions = {
  origin: "http://localhost:3000",
  method: "GET,OPTIONS,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type, Authorization",
};

app.use(cors(corsOptions));

app.use(express.json());

app.use("/api/movies", movieRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/views", viewRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/favourites", favouriteRoutes);

app.get("/", (req, res) => {
  res.send("Chào mừng đến với CINE Backend!");
});

// Khởi động server
app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});
