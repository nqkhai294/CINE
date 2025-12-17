import { user } from "@heroui/theme";
import axios from "axios";
import { use } from "react";

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

export const setLogoutCallback = (callback: () => void) => {
  logoutCallback = callback;
};

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Nếu backend trả về 401 (Unauthorized) - token hết hạn
    if (error.response && error.response.status === 401) {
      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

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
  }
);

// Movies API
/**
 * Get all movies
 */

export const getMovies = async () => {
  try {
    const response = await apiClient.get("/movies");

    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }

    return [];
  } catch (error) {
    console.error("Error fetching movies:", error);
    return [];
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

/**
 * Search movies by keyword
 */
export const searchMovies = async (keyword: string) => {
  try {
    const res = await apiClient.get(`/movies/search`, {
      params: { keyword },
    });

    if (res.data && res.data.result.status === "ok") {
      return res.data.data;
    }

    return [];
  } catch (error) {
    console.error("Error searching movies:", error);
    return [];
  }
};

// Auth API

/**
 * Login user
 */

export const loginUser = async (
  username: string,
  password: string,
  turnstileToken: string
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
  turnstileToken: string
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
