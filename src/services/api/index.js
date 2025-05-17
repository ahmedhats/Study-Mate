import axiosInstance from "./axiosConfig";

/**
 * Make a GET request to the API
 * @param {string} url - The API endpoint
 * @param {Object} options - Additional axios options
 * @returns {Promise<Object>} - The API response
 */
export const get = async (url, options = {}) => {
  try {
    const response = await axiosInstance.get(url, options);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    console.error(`GET Error (${url}):`, error);
    return {
      success: false,
      message: error.response?.data?.message || "Request failed",
      status: error.response?.status || 500,
    };
  }
};

/**
 * Make a POST request to the API
 * @param {string} url - The API endpoint
 * @param {Object} data - The data to send
 * @param {Object} options - Additional axios options
 * @returns {Promise<Object>} - The API response
 */
export const post = async (url, data = {}, options = {}) => {
  try {
    const response = await axiosInstance.post(url, data, options);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    console.error(`POST Error (${url}):`, error);
    return {
      success: false,
      message: error.response?.data?.message || "Request failed",
      status: error.response?.status || 500,
    };
  }
};

/**
 * Make a PUT request to the API
 * @param {string} url - The API endpoint
 * @param {Object} data - The data to send
 * @param {Object} options - Additional axios options
 * @returns {Promise<Object>} - The API response
 */
export const put = async (url, data = {}, options = {}) => {
  try {
    const response = await axiosInstance.put(url, data, options);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    console.error(`PUT Error (${url}):`, error);
    return {
      success: false,
      message: error.response?.data?.message || "Request failed",
      status: error.response?.status || 500,
    };
  }
};

/**
 * Make a DELETE request to the API
 * @param {string} url - The API endpoint
 * @param {Object} options - Additional axios options
 * @returns {Promise<Object>} - The API response
 */
export const del = async (url, options = {}) => {
  try {
    const response = await axiosInstance.delete(url, options);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    console.error(`DELETE Error (${url}):`, error);
    return {
      success: false,
      message: error.response?.data?.message || "Request failed",
      status: error.response?.status || 500,
    };
  }
}; 