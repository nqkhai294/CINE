// src/server.js
const express = require("express");
const db = require("./db");
const app = express();
const port = process.env.PORT || 4200;

// Import routes
const movieRoutes = require("./routes/movies");
const authRoutes = require("./routes/auth");
const ratingRoutes = require("./routes/ratings");
const reviewRoutes = require("./routes/reviews");
const viewRoutes = require("./routes/views");
const searchRoutes = require("./routes/search");

app.use(express.json());

app.use("/api/movies", movieRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/views", viewRoutes);
app.use("/api/search", searchRoutes);

app.get("/", (req, res) => {
  res.send("Chào mừng đến với CINE Backend!");
});

// Khởi động server
app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});
