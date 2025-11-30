// src/controllers/recommendationController.js
const db = require("../db");
const { PythonShell } = require("python-shell");
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
      pythonPath: "python",
      scriptPath: scriptPath,
      args: [movieId],
    };

    // 3. Chạy script Python
    PythonShell.run(scriptFile, options)
      .then((messages) => {
        // messages là mảng các dòng output từ script Python

        if (!messages || messages.length === 0 || messages[0] === "") {
          return res.status(200).json({
            result: { status: "ok", message: "Không tìm thấy phim tương tự" },
            data: [],
          });
        }

        // messages[0] đang là string các ID phim, ví dụ: "12,45,78,23"
        // Chuyển nó về mảng (array) các con số
        const recommendedIds = messages[0]
          .split(",")
          .map((id) => parseInt(id, 10));

        // 4. Lấy thông tin đầy đủ của các phim từ CSDL (vì Python chỉ trả ID)
        db.query(
          // 'ANY' là cách query "bất kỳ ID nào trong mảng"
          `SELECT 
            m.*,
            COALESCE(ARRAY_AGG(g.name), '{}') AS genres
            
          FROM Movies m
          LEFT JOIN Movie_Genres mg ON m.id = mg.movie_id
          LEFT JOIN Genres g ON mg.genre_id = g.id
          WHERE 
            m.id = ANY($1::int[]) -- Lọc theo ID gợi ý từ Python
          GROUP BY m.id;`,
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
