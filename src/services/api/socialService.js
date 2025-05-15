import axiosInstance from "./axiosConfig";

// Get the current user's friends
export const getUserFriends = async () => {
  try {
    const response = await axiosInstance.get("/social/friends");
    return response.data;
  } catch (error) {
    console.error("Error fetching friends:", error);
    return {
      error: error.response?.data?.message || "Failed to fetch friends",
    };
  }
};

// Search for users
export const searchUsers = async (query) => {
  try {
    const response = await axiosInstance.get(`/users/search?query=${query}`);
    console.log("Search results:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error searching users:", error);
    return { error: error.response?.data?.message || "Failed to search users" };
  }
};

// Send a friend request
export const sendFriendRequest = async (userId) => {
  try {
    console.log("Sending friend request to:", userId);
    const response = await axiosInstance.post("/social/friend-requests/send", {
      userId,
    });
    return response.data;
  } catch (error) {
    console.error("Error sending friend request:", error);
    return {
      error: error.response?.data?.message || "Failed to send friend request",
    };
  }
};

// Accept a friend request
export const acceptFriendRequest = async (requestId) => {
  try {
    console.log("Accepting friend request from:", requestId);
    const response = await axiosInstance.post(
      "/social/friend-requests/accept",
      { requestId }
    );
    return response.data;
  } catch (error) {
    console.error("Error accepting friend request:", error);
    return {
      error: error.response?.data?.message || "Failed to accept friend request",
    };
  }
};

// Reject a friend request
export const rejectFriendRequest = async (requestId) => {
  try {
    console.log("Rejecting friend request from:", requestId);
    const response = await axiosInstance.post(
      "/social/friend-requests/reject",
      { requestId }
    );
    return response.data;
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    return {
      error: error.response?.data?.message || "Failed to reject friend request",
    };
  }
};

// Remove a friend
export const removeFriend = async (userId) => {
  try {
    const response = await axiosInstance.delete(`/social/friends/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error removing friend:", error);
    return {
      error: error.response?.data?.message || "Failed to remove friend",
    };
  }
};

// Get pending friend requests
export const getPendingRequests = async () => {
  try {
    const response = await axiosInstance.get("/social/friend-requests/pending");
    return response.data;
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    return {
      error:
        error.response?.data?.message || "Failed to fetch pending requests",
    };
  }
};

// Get sent friend requests
export const getSentRequests = async () => {
  try {
    const response = await axiosInstance.get("/social/friend-requests/sent");
    return response.data;
  } catch (error) {
    console.error("Error fetching sent requests:", error);
    return {
      error: error.response?.data?.message || "Failed to fetch sent requests",
    };
  }
};
