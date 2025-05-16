import axios from "axios";

// Default API config
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * API service for making backend API calls
 */
const apiService = {
  /**
   * Get the axios client for direct use
   */
  getClient() {
    return apiClient;
  },

  /**
   * Set authorization token for API calls
   */
  setAuthToken(token) {
    if (token) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common["Authorization"];
    }
  },

  /**
   * GET request
   */
  async get(endpoint, config = {}) {
    return await apiClient.get(endpoint, config);
  },

  /**
   * POST request
   */
  async post(endpoint, data = {}, config = {}) {
    return await apiClient.post(endpoint, data, config);
  },

  /**
   * PUT request
   */
  async put(endpoint, data = {}, config = {}) {
    return await apiClient.put(endpoint, data, config);
  },

  /**
   * DELETE request
   */
  async delete(endpoint, config = {}) {
    return await apiClient.delete(endpoint, config);
  },
};

export default apiService;
