import axios from "axios";

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
