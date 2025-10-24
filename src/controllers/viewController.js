const db = require("../db");

module.exports.logView = async (req, res) => {
  try {
    const { movieId } = req.body;
    const userId = req.user.id; // Get from middleware 'protect'

    if (!movieId) {
      return res.status(400).json({ message: "Miss movie ID !" });
    }

    // Insert view record into the database
    const query = {
      text: `INSERT INTO views (user_id, movie_id)
                   VALUES ($1, $2)`,
      values: [userId, movieId],
    };

    await db.query(query);

    return res.status(201).json({
      result: {
        status: "ok",
        message: "View logged successfully",
      },
    });
  } catch (error) {
    console.error("Error logging view:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
