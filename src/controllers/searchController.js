const e = require("express");
const db = require("../db");
const { stack } = require("../routes/views");

module.exports.logSearch = async (req, res) => {
  try {
    console.log("req.body", req.body);

    const userId = req.user.id; // Get from middleware 'protect'

    if (!keyword || keyword.trim() === "") {
      return res.status(400).json({ message: "Missing search keyword!" });
    }

    const query = {
      text: `INSERT INTO search_history (user_id, keyword)
                   VALUES ($1, $2)`,
      values: [userId, keyword.trim()],
    };

    await db.query(query);

    res.status(201).json({
      result: {
        status: "ok",
        message: "Search logged successfully",
      },
    });
  } catch (error) {
    console.log("Error when log search", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
