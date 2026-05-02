const jwt = require("jsonwebtoken");
const db = require("../db");

module.exports.protect = async (req, res, next) => {
  let token;

  // Get token from headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Split token
      token = req.headers.authorization.split(" ")[1];
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // get userInfor from token
      req.user = (
        await db.query(`SELECT id, username FROM users WHERE id = $1`, [
          decoded.id,
        ])
      ).rows[0];

      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Not authorized, user not found" });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

/**
 * Nếu có Bearer token hợp lệ thì gán req.user; nếu không có hoặc lỗi thì req.user = undefined.
 * Dùng cho các API public nhưng có thể cá nhân hóa khi đã đăng nhập.
 */
module.exports.optionalProtect = async (req, res, next) => {
  req.user = undefined;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { rows } = await db.query(
        `SELECT id, username FROM users WHERE id = $1`,
        [decoded.id],
      );
      if (rows[0]) req.user = rows[0];
    } catch (e) {
      // Token hết hạn / sai: coi như khách, không trả 401
    }
  }
  next();
};
