// src/controllers/recommendationController.js
const db = require("../db");
const { PythonShell } = require("python-shell"); // <--- Import "cầu nối"
const path = require("path");

/**
 * API: GET /api/recommendations/similar/:movieId
 * Mục đích: Lấy các phim tương tự (Content-Based) bằng cách gọi script Python
 */
module.exports.getSimilarMovies = async (req, res) => {
  try {
    const { movieId } = req.params;

    // 1. Chỉ định đường dẫn đến script Python
    const scriptPath = path.join(__dirname, "..", "..", "ml_model");
    const scriptFile = "get_content_recs.py";

    // 2. Thiết lập các tùy chọn
    const options = {
      mode: "text",
      pythonPath: "python", // (Hoặc 'py' nếu 'python' không chạy)
      scriptPath: scriptPath, // Đường dẫn đến thư mục chứa script
      args: [movieId], // Truyền movieId vào làm "sys.argv[1]"
    };

    // 3. Chạy script Python
    PythonShell.run(scriptFile, options)
      .then((messages) => {
        // "messages" là một mảng (array) chứa TẤT CẢ những gì Python "print()"
        // Script của ta chỉ print() 1 dòng, nên ta lấy messages[0]

        if (!messages || messages.length === 0 || messages[0] === "") {
          return res.status(200).json({
            result: { status: "ok", message: "Không tìm thấy phim tương tự" },
            data: [],
          });
        }

        // messages[0] đang là "787699,872585,1022789"
        // Chuyển nó về mảng (array) các con số
        const recommendedIds = messages[0]
          .split(",")
          .map((id) => parseInt(id, 10));

        // 4. Lấy thông tin đầy đủ của các phim từ CSDL (vì Python chỉ trả ID)
        db.query(
          // 'ANY' là cách query "bất kỳ ID nào trong mảng"
          "SELECT id, title, poster_url, avg_rating FROM Movies WHERE id = ANY($1::int[])",
          [recommendedIds]
        )
          .then((result) => {
            // 5. Trả về kết quả
            res.status(200).json({
              result: {
                status: "ok",
                message: "Tải phim tương tự (ML) thành công",
              },
              data: result.rows,
            });
          })
          .catch((dbError) => {
            console.error("Lỗi khi query CSDL:", dbError);
            res.status(500).json({ message: "Lỗi server (DB Query)" });
          });
      })
      .catch((pyError) => {
        console.error("Lỗi khi chạy script Python:", pyError);
        res.status(500).json({ message: "Lỗi server (Python script)" });
      });
  } catch (error) {
    console.error("Lỗi controller:", error);
    res.status(500).json({ message: "Lỗi server (Controller)" });
  }
};
