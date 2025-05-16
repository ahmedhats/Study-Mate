import axiosInstance from "./axiosConfig";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

function getToken() {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  return userData.token || localStorage.getItem("token") || "";
}

// Get all tasks
export const getAllTasks = async () => {
  try {
    const response = await axiosInstance.get("/tasks");
    return response;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return {
      error: error.response?.data?.message || "Failed to fetch tasks",
    };
  }
};

// Get tasks by date range
export const getTasksByDateRange = async (startDate, endDate) => {
  try {
    const response = await axiosInstance.get("/tasks/search", {
      params: {
        startDate,
        endDate,
      },
    });
    return response;
  } catch (error) {
    console.error("Error fetching tasks by date range:", error);
    return {
      error: error.response?.data?.message || "Failed to fetch tasks by date range",
    };
  }
};

// Create a new task
export const createTask = async (taskData) => {
  try {
    const response = await axiosInstance.post("/tasks", taskData);
    return response;
  } catch (error) {
    console.error("Error creating task:", error);
    return {
      error: error.response?.data?.message || "Failed to create task",
    };
  }
};

// Update a task
export const updateTask = async (taskId, taskData) => {
  try {
    const response = await axiosInstance.put(`/tasks/${taskId}`, taskData);
    return response;
  } catch (error) {
    console.error("Error updating task:", error);
    return {
      error: error.response?.data?.message || "Failed to update task",
    };
  }
};

// Delete a task
export const deleteTask = async (taskId) => {
  try {
    if (!taskId) {
      console.error("No taskId provided to deleteTask");
      return { error: "Task ID is required" };
    }

    console.log("Making delete request for task:", taskId);
    const response = await axiosInstance.delete(`/tasks/${taskId}`);
    console.log("Delete API raw response:", response);
    
    // Check if we have a valid response
    if (!response) {
      console.error("No response from delete API");
      return { error: "No response from server" };
    }

    // Return the response data with success flag
    return {
      data: {
        success: true,
        ...response.data
      },
      error: null
    };
  } catch (error) {
    console.error("Error in deleteTask service:", error);
    console.error("Error response:", error.response);
    console.error("Error request config:", error.config);
    return {
      error: error.response?.data?.message || "Failed to delete task",
      data: null
    };
  }
};

// Search tasks
export const searchTasks = async (query) => {
  try {
    const response = await axiosInstance.get("/tasks/search", {
      params: { query },
    });
    return response;
  } catch (error) {
    console.error("Error searching tasks:", error);
    return {
      error: error.response?.data?.message || "Failed to search tasks",
    };
  }
};

// Add team member to task
export const addTeamMember = async (taskId, userData) => {
  try {
    const response = await axiosInstance.post(`/tasks/${taskId}/team-members`, userData);
    return response;
  } catch (error) {
    console.error("Error adding team member:", error);
    return {
      error: error.response?.data?.message || "Failed to add team member",
    };
  }
};

// Update team member permissions
export const updateTeamMember = async (taskId, userId, permissions) => {
  try {
    const response = await axiosInstance.put(
      `/tasks/${taskId}/team-members/${userId}`,
      { permissions }
    );
    return response;
  } catch (error) {
    console.error("Error updating team member:", error);
    return {
      error: error.response?.data?.message || "Failed to update team member",
    };
  }
};

// Remove team member from task
export const removeTeamMember = async (taskId, userId) => {
  try {
    const response = await axiosInstance.delete(`/tasks/${taskId}/team-members/${userId}`);
    return response;
  } catch (error) {
    console.error("Error removing team member:", error);
    return {
      error: error.response?.data?.message || "Failed to remove team member",
    };
  }
};
