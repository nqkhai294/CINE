import http from "k6/http";
import { check, sleep, group } from "k6";

// --- 1. DATA INPUT ---
const MOVIE_IDS = [
  11, 12, 13, 18, 22, 24, 27, 35, 38, 58, 62, 77, 78, 85, 97, 98, 101, 103, 105,
  106, 107, 111, 114, 118, 120, 121, 122, 128, 129, 137, 155, 161, 162,
];

// --- 2. CẤU HÌNH STRESS TEST (STEP STRESS) ---
export const options = {
  stages: [
    { duration: "30s", target: 25 },
    { duration: "1m", target: 25 },

    { duration: "30s", target: 50 },
    { duration: "1m", target: 50 },

    { duration: "30s", target: 75 },
    { duration: "1m", target: 75 },

    { duration: "30s", target: 0 },
  ],

  // --- THRESHOLDS THEO TAGS ---
  thresholds: {
    http_req_failed: ["rate<0.05"],

    "http_req_duration{name:Home_Page}": ["p(95)<2000"],

    "http_req_duration{name:API_Detail}": ["p(95)<1000"],

    "http_req_duration{name:API_ML}": ["p(95)<5000"],
  },
};

const BASE_URL_FE = "http://localhost:3000";
const BASE_URL_BE = "http://localhost:4200";

const apiParams = {
  headers: { "Content-Type": "application/json" },
};

export default function () {
  const randomId = MOVIE_IDS[Math.floor(Math.random() * MOVIE_IDS.length)];

  // === BƯỚC 1: VÀO TRANG CHỦ ===
  group("Step 1: Home Page", function () {
    const resHome = http.get(`${BASE_URL_FE}/?nocache=${Date.now()}`, {
      tags: { name: "Home_Page" },
    });

    check(resHome, { "Home 200": (r) => r.status === 200 });
  });

  sleep(1);

  // === BƯỚC 2: VÀO DETAIL & GỌI API ===
  group(`Step 2: Detail Movie ${randomId}`, function () {
    const resPage = http.get(
      `${BASE_URL_FE}/movie/${randomId}?nocache=${Date.now()}`,
      {
        tags: { name: "Detail_HTML" },
      }
    );
    check(resPage, { "Detail HTML 200": (r) => r.status === 200 });

    const responses = http.batch([
      [
        "GET",
        `${BASE_URL_BE}/api/movies/${randomId}`,
        null,
        { headers: apiParams.headers, tags: { name: "API_Detail" } },
      ],
      [
        "GET",
        `${BASE_URL_BE}/api/recommendations/similar/${randomId}`,
        null,
        { headers: apiParams.headers, tags: { name: "API_ML" } },
      ],
    ]);

    check(responses[0], { "API Info OK": (r) => r.status === 200 });
    check(responses[1], { "API Recs OK": (r) => r.status === 200 });
  });

  sleep(1);
}
