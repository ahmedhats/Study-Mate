import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function getToken() {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  return userData.token || localStorage.getItem("token") || "";
}

// Get all tasks
export const getAllTasks = async () => {
  const token = getToken();
  return axios.get(`${API_URL}/tasks`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Get tasks by date range
export const getTasksByDateRange = async (startDate, endDate) => {
  const token = getToken();
  return axios.get(`${API_URL}/tasks/search`, {
    params: {
      startDate,
      endDate,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Create a new task
export const createTask = async (taskData) => {
  const token = getToken();
  return axios.post(`${API_URL}/tasks`, taskData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Update a task
export const updateTask = async (taskId, taskData) => {
  const token = getToken();
  return axios.put(`${API_URL}/tasks/${taskId}`, taskData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Delete a task
export const deleteTask = async (taskId) => {
  const token = getToken();
  return axios.delete(`${API_URL}/tasks/${taskId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Search tasks
export const searchTasks = async (query) => {
  const token = getToken();
  return axios.get(`${API_URL}/tasks/search`, {
    params: { query },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Add team member to task
export const addTeamMember = async (taskId, userData) => {
  const token = getToken();
  return axios.post(`${API_URL}/tasks/${taskId}/team-members`, userData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Update team member permissions
export const updateTeamMember = async (taskId, userId, permissions) => {
  const token = getToken();
  return axios.put(
    `${API_URL}/tasks/${taskId}/team-members/${userId}`,
    { permissions },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// Remove team member from task
export const removeTeamMember = async (taskId, userId) => {
  const token = getToken();
  return axios.delete(`${API_URL}/tasks/${taskId}/team-members/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
