import axios from "axios";
import type { Movie } from "@/types";

const API_URL = "http://localhost:4200/api";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Set token when user login successfully
 */

export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
};

/**
 * Setup response interceptor to handle 401 errors (token expired)
 * Tự động logout khi backend trả về 401
 */
let logoutCallback: (() => void) | null = null;
let isLoggingOut = false; // Flag để tránh hiện nhiều toast khi logout

export const setLogoutCallback = (callback: () => void) => {
  logoutCallback = callback;
};

export const setLoggingOut = (value: boolean) => {
  isLoggingOut = value;
};

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Nếu backend trả về 401 (Unauthorized) - token hết hạn
    // CHỈ xử lý khi KHÔNG PHẢI logout chủ động
    if (error.response && error.response.status === 401 && !isLoggingOut) {
      // Kiểm tra xem có phải lỗi từ login/register không
      const isAuthEndpoint =
        error.config?.url?.includes("/auth/login") ||
        error.config?.url?.includes("/auth/register");

      // Nếu là auth endpoint (login/register sai), không redirect
      // Để component tự xử lý hiển thị lỗi
      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      // Còn lại là token hết hạn thật sự
      // Clear localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }

      // Call logout callback nếu có
      if (logoutCallback) {
        logoutCallback();
      }

      // Redirect về trang chủ với message
      if (typeof window !== "undefined") {
        window.location.href = "/?session_expired=true";
      }
    }

    return Promise.reject(error);
  },
);

// Movies API

export type MoviesListPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type GetMoviesResult = {
  data: Movie[];
  pagination: MoviesListPagination;
  /** true khi đã đăng nhập, có rating, có keyword và ML rerank thành công */
  personalized?: boolean;
};

/**
 * Danh sách phim có phân trang (GET /api/movies)
 */
export const getMovies = async (params?: {
  page?: number;
  limit?: number;
  keyword?: string;
}): Promise<GetMoviesResult> => {
  const empty: GetMoviesResult = {
    data: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    personalized: false,
  };
  try {
    const response = await apiClient.get("/movies", {
      params: {
        page: params?.page,
        limit: params?.limit,
        ...(params?.keyword?.trim()
          ? { keyword: params.keyword.trim() }
          : {}),
      },
    });

    const data = response.data?.data;
    const pagination = response.data?.pagination;

    if (Array.isArray(data) && pagination && typeof pagination === "object") {
      return {
        data,
        pagination: {
          page: Number(pagination.page) || 1,
          limit: Number(pagination.limit) || 20,
          total: Number(pagination.total) || 0,
          totalPages: Number(pagination.totalPages) || 0,
        },
        personalized: Boolean(response.data?.personalized),
      };
    }

    if (Array.isArray(data)) {
      return {
        data,
        pagination: {
          page: 1,
          limit: data.length,
          total: data.length,
          totalPages: 1,
        },
      };
    }

    return empty;
  } catch (error) {
    console.error("Error fetching movies:", error);
    return empty;
  }
};

/**
 * Get 6 highest rated movies
 */
export const getHighestRatedMovies = async () => {
  try {
    const res = await apiClient.get("/movies/highest-rate");

    if (res.data && Array.isArray(res.data.data)) {
      //   console.log("Newest movies data:", res.data.data);
      return res.data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching newest movies:", error);
    return [];
  }
};

/**
 * Get 10 newest movies
 */

export const getNewestMovies = async () => {
  try {
    const res = await apiClient.get("/movies/newest");
    if (res.data && res.data.result.status) {
      return res.data.data;
    } else return [];
  } catch (error) {
    console.error("Error fetching newest movies:", error);
    return [];
  }
};

/** Phim xu hướng: release_year gần đây + tmdb_vote_average cao (public). */
export const getTrendingRatedMovies = async (): Promise<Movie[]> => {
  try {
    const res = await apiClient.get("/movies/trending-rated");
    if (res.data?.result?.status === "ok" && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching trending rated movies:", error);
    return [];
  }
};

/**
 * Get movie by ID
 */
export const getMovieDetails = async (id: string | number) => {
  try {
    const res = await apiClient.get(`/movies/${id}`);

    if (res.data && res.data.result.status) {
      return res.data.data;
    } else return null;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
};

export const getSimilarMovies = async (id: string | number) => {
  try {
    const res = await apiClient.get(`/recommendations/similar/${id}`);

    if (res.data && Array.isArray(res.data.data)) {
      return res.data.data;
    }

    return [];
  } catch (error) {
    console.error("Error fetching similar movies:", error);
    return [];
  }
};

// Movies progressing (user is currently watching)
export type ProgressingMovie = {
  movie_id: number;
  title: string;
  backdrop_url: string;
  progress_seconds: number;
  duration: number;
  updated_at: string;
};

export const getProgressingMovies = async (): Promise<ProgressingMovie[]> => {
  try {
    const res = await apiClient.get("/movies/progressing");
    if (res.data && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    return [];
  } catch (error: any) {
    console.error("Error fetching progressing movies:", error.response?.data);
    return [];
  }
};

// Recommendations: genres (cá nhân hóa)
export type RecommendedGenre = {
  genre_name: string;
  genre_id: string;
  total_score: string;
};

export const getRecommendedGenres = async (): Promise<RecommendedGenre[]> => {
  try {
    const res = await apiClient.get("/recommendations/genres");
    if (res.data && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    return [];
  } catch (error: any) {
    console.error("Error fetching recommended genres:", error.response?.data);
    return [];
  }
};

export type SearchMoviesPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type SearchMoviesResult = {
  data: Movie[];
  pagination: SearchMoviesPagination;
  personalized?: boolean;
};

/**
 * Tìm phim theo từ khóa (navbar / dropdown), có phân trang.
 */
export const searchMovies = async (
  keyword: string,
  params?: { page?: number; limit?: number },
): Promise<SearchMoviesResult> => {
  const empty: SearchMoviesResult = {
    data: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    personalized: false,
  };
  try {
    const res = await apiClient.get(`/movies/search`, {
      params: {
        keyword,
        page: params?.page,
        limit: params?.limit,
      },
    });

    if (res.data && res.data.result?.status === "ok") {
      const data = res.data.data;
      const p = res.data.pagination;
      if (Array.isArray(data) && p) {
        return {
          data,
          pagination: {
            page: Number(p.page) || 1,
            limit: Number(p.limit) || 20,
            total: Number(p.total) || 0,
            totalPages: Number(p.totalPages) || 0,
          },
          personalized: Boolean(res.data.personalized),
        };
      }
      if (Array.isArray(data)) {
        return {
          data,
          pagination: {
            page: 1,
            limit: data.length,
            total: data.length,
            totalPages: 1,
          },
        };
      }
    }

    return empty;
  } catch (error) {
    console.error("Error searching movies:", error);
    return empty;
  }
};

// Auth API

/**
 * Login user
 */

export const loginUser = async (
  username: string,
  password: string,
  turnstileToken: string,
) => {
  try {
    const res = await apiClient.post("/auth/login", {
      username,
      password,
      turnstileToken,
    });

    if (res.data && res.data.result.status) {
      return res.data; // Assuming the token is in data
    }
    return null;
  } catch (error: any) {
    console.error("Error logging in:", error.response?.data);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Network or server error occurred");
  }
};

/**
 * Register user
 */
export const registerUser = async (
  email: string,
  username: string,
  password: string,
  displayName: string,
  turnstileToken: string,
) => {
  try {
    const res = await apiClient.post("/auth/register", {
      email,
      username,
      password,
      displayName,
      turnstileToken,
    });

    return res.data;
  } catch (error: any) {
    console.error("Error registering user:", error.response?.data);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message);
    }

    throw new Error("Network or server error occurred");
  }
};

/**
 * Get current user profile
 * API sẽ tự động lấy user hiện tại từ token
 */
export const getCurrentUser = async (userId: string) => {
  try {
    const res = await apiClient.get(`/users/${userId}`);
    return res.data;
  } catch (error: any) {
    console.error("Error fetching current user:", error.response?.data);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Network or server error occurred");
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (profileData: {
  bio?: string;
  avatar_url?: string;
  date_of_birth?: string;
  gender?: string;
}) => {
  try {
    const res = await apiClient.put("/users/profile", profileData);
    return res.data;
  } catch (error: any) {
    console.error("Error updating profile:", error.response?.data);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Network or server error occurred");
  }
};

/**
 * Update user avatar
 */
export const updateUserAvatar = async (avatar_url: string) => {
  try {
    const res = await apiClient.put("/users/avatar", { avatar_url });
    return res.data;
  } catch (error: any) {
    console.error("Error updating avatar:", error.response?.data);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Network or server error occurred");
  }
};

// Watchlist API

/**
 * Add movie to watchlist
 */
export const addToWatchlist = async (movieId: string | number) => {
  try {
    const res = await apiClient.post("/watchlist", { movieId });
    return res.data;
  } catch (error: any) {
    console.error("Error adding to watchlist:", error.response?.data);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Network or server error occurred");
  }
};

/**
 * Remove movie from watchlist
 */
export const removeFromWatchlist = async (movieId: string | number) => {
  try {
    const res = await apiClient.delete(`/watchlist/${movieId}`);
    return res.data;
  } catch (error: any) {
    console.error("Error removing from watchlist:", error.response?.data);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Network or server error occurred");
  }
};

/**
 * Get user's watchlist
 */
export const getWatchlist = async () => {
  try {
    const res = await apiClient.get("/watchlist");
    if (res.data && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    return [];
  } catch (error: any) {
    console.error("Error fetching watchlist:", error.response?.data);
    return [];
  }
};

/**
 * Check if movie is in watchlist
 */
export const checkInWatchlist = async (movieId: string | number) => {
  try {
    const res = await apiClient.get(`/watchlist/check/${movieId}`);
    return res.data;
  } catch (error: any) {
    console.error("Error checking watchlist:", error.response?.data);
    return { isInWatchlist: false };
  }
};

/**
 * Get watchlist count
 */
export const getWatchlistCount = async () => {
  try {
    const res = await apiClient.get("/watchlist/count");
    if (res.data && typeof res.data.count === "number") {
      return res.data.count;
    }
    return 0;
  } catch (error: any) {
    console.error("Error fetching watchlist count:", error.response?.data);
    return 0;
  }
};

// Favourites API

/**
 * add movie to favourites
 * @param movieId
 * @returns
 */
export const addToFavouritesList = async (movieId: string | number) => {
  try {
    const res = await apiClient.post("/favourites", { movieId });
    return res.data;
  } catch (error: any) {
    console.error("Error adding to favourites:", error.response?.data);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Network or server error occurred");
  }
};

export const removeFromFavouritesList = async (movieId: string | number) => {
  try {
    const res = await apiClient.delete(`/favourites/${movieId}`);
    return res.data;
  } catch (error: any) {
    console.error("Error removing from favourites:", error.response?.data);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Network or server error occurred");
  }
};

/**
 * Get user's favourites
 */
export const getFavouritesList = async () => {
  try {
    const res = await apiClient.get("/favourites");
    if (res.data && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    return [];
  } catch (error: any) {
    console.error("Error fetching favourites:", error.response?.data);
    return [];
  }
};

/**
 * check if movie is in favourites list
 * @returns
 */
export const checkInFavouritesList = async (movieId: string | number) => {
  try {
    const res = await apiClient.get(`/favourites/check/${movieId}`);
    return res.data;
  } catch (error: any) {
    console.error("Error checking favourites:", error.response?.data);
    return { isInFavourites: false };
  }
};

/**
 * get favourites count
 */
export const getFavouritesListCount = async () => {
  try {
    const res = await apiClient.get("/favourites/count");
    if (res.data && typeof res.data.count === "number") {
      return res.data.count;
    }
    return 0;
  } catch (error: any) {
    console.error("Error fetching favourites count:", error.response?.data);
    return 0;
  }
};

// Comments API

/**
 * Add comment to a movie
 */
export const addCommentToMovie = async (request: any) => {
  try {
    const res = await apiClient.post("/reviews", request);
    return res.data;
  } catch (error: any) {
    console.error("Error adding comment:", error.response?.data);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Network or server error occurred");
  }
};

/**
 * Get all comments for a movie
 */
export const getCommentsForMovie = async (movieId: string | number) => {
  try {
    const res = await apiClient.get(`/reviews/movie/${movieId}`);
    return res.data;
  } catch (error: any) {
    console.error("Error fetching comments:", error);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Network or server error occurred");
  }
};

// History Watch API
export const addToHistoryWatch = async (request: any) => {
  try {
    const res = await apiClient.post("/history-watch", request);
    return res.data;
  } catch (error: any) {
    console.error("Error adding history watch:", error.response?.data);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Network or server error occurred");
  }
};

export const getHistoryWatch = async () => {
  try {
    const res = await apiClient.get("/history-watch");
    return res.data;
  } catch (error: any) {
    console.error("Error fetching history watch:", error.response?.data);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Network or server error occurred");
  }
};

// Genres API
/**
 * Get all genres
 */

export const getAllGenres = async () => {
  try {
    const res = await apiClient.get("/genres");
    return res.data;
  } catch (error: any) {
    console.error("Error fetching genres:", error.response?.data);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Network or server error occurred");
  }
};

export type GenreMoviesPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type GenreMoviesApiResult = {
  success: boolean;
  genre: { id: string; name: string };
  movies: Movie[];
  pagination: GenreMoviesPagination;
  personalized?: boolean;
};

/** Danh sách phim theo thể loại (phân trang + optional keyword; có JWT + rating → rerank). */
export const getMoviesByGenre = async (
  genreId: string | number,
  params?: { page?: number; limit?: number; keyword?: string },
): Promise<GenreMoviesApiResult | null> => {
  try {
    const res = await apiClient.get(`/genres/${genreId}/movies`, {
      params: {
        page: params?.page,
        limit: params?.limit,
        ...(params?.keyword?.trim()
          ? { keyword: params.keyword.trim() }
          : {}),
      },
    });
    const d = res.data;
    if (!d || !d.success) return null;
    const p = d.pagination;
    return {
      success: true,
      genre: d.genre,
      movies: Array.isArray(d.movies) ? d.movies : [],
      pagination: {
        page: Number(p?.page) || 1,
        limit: Number(p?.limit) || 20,
        total: Number(p?.total) || 0,
        totalPages: Number(p?.totalPages) || 0,
      },
      personalized: Boolean(d.personalized),
    };
  } catch (error: any) {
    console.error("Error fetching movies by genre:", error.response?.data);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Network or server error occurred");
  }
};

/**
 * Get top movies by genre (Home rows)
 * GET /api/movies/genre/:genreId
 * Response: { data: Movie[] }
 */
export const getTopMoviesByGenre = async (
  genreId: string | number,
  limit = 10,
) => {
  try {
    const res = await apiClient.get(`/movies/genre/${genreId}`);
    if (res.data && Array.isArray(res.data.data)) {
      return res.data.data.slice(0, limit);
    }
    return [];
  } catch (error: any) {
    console.error("Error fetching top movies by genre:", error.response?.data);
    return [];
  }
};

// Actors API
/**
 * Get all actors
 */
export const getAllActors = async () => {
  try {
    const res = await apiClient.get("/actors");
    return res.data;
  } catch (error: any) {
    console.error("Error fetching actors:", error.response?.data);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Network or server error occurred");
  }
};

/**
 * Get movies by actor ID
 */
export const getMoviesByActor = async (actorId: string | number) => {
  try {
    const res = await apiClient.get(`/actors/${actorId}/movies`);
    return res.data;
  } catch (error: any) {
    console.error("Error fetching movies by actor:", error.response?.data);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Network or server error occurred");
  }
};

// Ratings API
/**
 * Add rating to a movie
 *  */
export const addRatingToMovie = async (request: any) => {
  try {
    const res = await apiClient.post("/ratings", request);
    return res.data;
  } catch (error: any) {
    console.error("Error adding rating:", error.response?.data);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Network or server error occurred");
  }
};

/**
 * Get average rating for a movie
 */
export const getAverageRatingForMovie = async (movieId: string | number) => {
  try {
    const res = await apiClient.get(`/ratings/movie/${movieId}`);
    return res.data;
  } catch (error: any) {
    console.error("Error fetching average rating:", error.response?.data);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Network or server error occurred");
  }
};

// Watch progress API (tiến độ + cấu hình xem)

export type WatchProgressData = {
  currentTime: number;
  duration?: number;
  playbackRate?: number;
  quality?: string | null;
  subtitleLang?: string | null;
  subtitleEnabled?: boolean;
  skipIntro?: boolean;
  updatedAt?: string;
} | null;

/**
 * Lấy tiến độ + cấu hình xem cho một phim (user đăng nhập).
 * GET /api/users/me/watch-progress?movie_id=...
 */
export const getWatchProgress = async (
  movieId: string | number,
): Promise<WatchProgressData> => {
  try {
    const res = await apiClient.get("/users/me/watch-progress", {
      params: { movie_id: movieId },
    });
    if (res.data && res.data.data !== undefined) {
      return res.data.data;
    }
    return null;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    console.error("Error fetching watch progress:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    return null;
  }
};

export type UpsertWatchProgressPayload = {
  movie_id: string | number;
  current_time?: number;
  duration?: number;
  playback_rate?: number;
  quality?: string | null;
  subtitle_lang?: string | null;
  subtitle_enabled?: boolean;
  skip_intro?: boolean;
};

/**
 * Lưu tiến độ + cấu hình xem (upsert). Chỉ gửi field cần cập nhật.
 * PUT /api/users/me/watch-progress
 */
export const upsertWatchProgress = async (
  payload: UpsertWatchProgressPayload,
) => {
  try {
    const res = await apiClient.put("/users/me/watch-progress", payload);
    return res.data;
  } catch (error: any) {
    console.error("Error saving watch progress:", error.response?.data);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Network or server error occurred");
  }
};
