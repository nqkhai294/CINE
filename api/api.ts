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
      return res.data.data; // Assuming the token is in data
    }
    return null;
  } catch (error) {
    console.error("Error logging in:", error);
    return null;
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
  } catch (error) {
    console.error("Error registering user:", error);
    return null;
  }
};
