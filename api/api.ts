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
