import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Get user statistics
export const getUserStats = async () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_URL}/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Update user statistics
export const updateUserStats = async (statsData) => {
  const token = localStorage.getItem("token");
  return axios.put(`${API_URL}/stats`, statsData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Get study history
export const getStudyHistory = async (period = "week") => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_URL}/stats/history?period=${period}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Get study distribution
export const getStudyDistribution = async () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_URL}/stats/distribution`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
