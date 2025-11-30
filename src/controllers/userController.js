const db = require("../db");

module.exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.body;
    const { row } = await db.query(
      `select * from user_profiles where user_id = $1`,
      [userId]
    );

    res.status(200).json({
      result: {
        message: "success",
        status: "ok",
      },
      data: row,
      total: row.length,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin user:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports.updateUserProfile = async (req, res) => {
  try {
    const { userId, bio, avatar_url, date_of_birth, gender } = req.body;
  } catch (error) {}
};
