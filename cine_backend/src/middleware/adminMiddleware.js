// src/middleware/adminMiddleware.js
const db = require("../db");

module.exports.adminOnly = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Cần đăng nhập để truy cập",
      });
    }

    // Kiểm tra role của user từ database
    const { rows } = await db.query("SELECT role FROM users WHERE id = $1", [
      req.user.id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy người dùng",
      });
    }

    const { role } = rows[0];

    // role = 1 Admin, role = 0 User
    if (role !== 1) {
      return res.status(403).json({
        status: "error",
        message: "Bạn không có quyền truy cập tài nguyên này",
      });
    }

    req.user.role = role;
    next();
  } catch (error) {
    console.error("Lỗi kiểm tra quyền admin:", error);
    res.status(500).json({
      status: "error",
      message: "Lỗi server",
    });
  }
};
