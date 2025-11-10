// TMDB (The Movie Database) Configuration
export const TMDB_CONFIG = {
  IMAGE_BASE_URL: "https://image.tmdb.org/t/p/original",
  IMAGE_SIZES: {
    POSTER: {
      w92: "https://image.tmdb.org/t/p/w92",
      w154: "https://image.tmdb.org/t/p/w154",
      w185: "https://image.tmdb.org/t/p/w185",
      w342: "https://image.tmdb.org/t/p/w342",
      w500: "https://image.tmdb.org/t/p/w500",
      w780: "https://image.tmdb.org/t/p/w780",
      original: "https://image.tmdb.org/t/p/original",
    },
    BACKDROP: {
      w300: "https://image.tmdb.org/t/p/w300",
      w780: "https://image.tmdb.org/t/p/w780",
      w1280: "https://image.tmdb.org/t/p/w1280",
      original: "https://image.tmdb.org/t/p/original",
    },
  },
};

// Genre IDs from TMDB
export const GENRE_MAP: Record<number, string> = {
  28: "Hành Động",
  12: "Phiêu Lưu",
  16: "Hoạt Hình",
  35: "Hài Hước",
  80: "Hình Sự",
  99: "Tài Liệu",
  18: "Chính Kịch",
  10751: "Gia Đình",
  14: "Fantasy",
  36: "Lịch Sử",
  27: "Kinh Dị",
  10402: "Nhạc",
  9648: "Bí Ẩn",
  10749: "Lãng Mạn",
  878: "Khoa Học Viễn Tưởng",
  10770: "Phim Truyền Hình",
  53: "Gay Cấn",
  10752: "Chiến Tranh",
  37: "Miền Tây",
};

