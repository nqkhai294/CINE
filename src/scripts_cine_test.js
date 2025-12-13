import http from "k6/http";
import { check, sleep, group } from "k6";

// 1. Cấu hình kịch bản test (OPTIONS)

export const options = {
  stages: [
    { duration: "10s", target: 30 }, // GD 1: Tăng dần lên 10 người dùng trong 10s
    { duration: "30s", target: 30 }, // Giai đoạn 2: Giữ ổn định 10 người dùng (Giai đoạn chính)
    { duration: "10s", target: 0 }, // Giai đoạn 3: Giảm dần về 0 để kết thúc
  ],

  thresholds: {
    // 95% các request phải hoàn thành trong vòng 2000ms
    http_req_duration: ["p(95)<2000"],

    // Tỷ lệ lỗi phải dưới 1%
    http_req_failed: ["rate<0.01"],
  },
};

// 2. Địa chỉ SERVER

const BASE_URL_FE = "http://localhost:3000";
const BASE_URL_BE = "http://localhost:4200";
const MOVIE_ID = 155; // ID phim dùng để test

export default function () {
  // Truy cập trang home
  group("01_Visit_Homepage", function () {
    const res = http.get(`${BASE_URL_FE}/`);

    check(res, {
      "Home status is 200": (r) => r.status === 200,
    });
  });

  sleep(1);

  // Xem chi tiết film
  group("02_View_Movie_Detail", function () {
    const res = http.get(`${BASE_URL_FE}/movie/${MOVIE_ID}`);

    check(res, {
      "Movie Detail status is 200": (r) => r.status === 200,
    });
  });

  sleep(2);

  // Gọi api gợi ý
  group("03_Get_Recommendations_API", function () {
    const url = `${BASE_URL_BE}/api/recommendations/similar/${MOVIE_ID}`;

    const res = http.get(url);

    check(res, {
      "Recommendations API status is 200": (r) => r.status === 200,
      // Kiểm tra API phản hồi nhanh hơn 1.5 giây không
      "ML Response time < 1500ms": (r) => r.timings.duration < 1500,
    });
  });

  // Nghỉ 1 giây trước khi lặp lại vòng lặp
  sleep(1);
}
