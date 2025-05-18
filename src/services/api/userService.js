import axiosInstance from "./axiosConfig";

export const getUserProfile = async () => {
  try {
    console.log("Fetching user profile from API...");
    const response = await axiosInstance.get("/users/profile");

    // Log response data for debugging
    console.log("User profile API response:", response);
    console.log("User profile data from API:", response.data);

    if (response.data && response.data.success === false) {
      console.error("API returned error:", response.data.message);
      throw new Error(response.data.message || "Failed to fetch user profile");
    }

    // If the API returned a success property, return the data field
    if (response.data && response.data.success === true) {
      const apiData = response.data.data || response.data;

      // Merge with localStorage data to ensure no data loss
      try {
        const localStorageData = localStorage.getItem("userData");
        if (localStorageData) {
          const parsedLocalData = JSON.parse(localStorageData);
          const localUserData = parsedLocalData.user || parsedLocalData;

          // Create merged data, prioritizing API data but ensuring we preserve
          // profile setup data like education, major, etc. if it exists in localStorage
          // but is missing in the API response
          const mergedData = {
            ...localUserData,
            ...apiData,
            // Ensure profile setup data is preserved
            education: apiData.education || localUserData.education || "",
            major: apiData.major || localUserData.major || "",
            interests: apiData.interests || localUserData.interests || [],
            hobbies: apiData.hobbies || localUserData.hobbies || [],
            studyPreference:
              apiData.studyPreference || localUserData.studyPreference || "",
            studyGoals: apiData.studyGoals || localUserData.studyGoals || "",
            profileCompleted:
              apiData.profileCompleted ||
              localUserData.profileCompleted ||
              false,
          };

          return mergedData;
        }
      } catch (localStorageError) {
        console.error("Error merging localStorage data:", localStorageError);
      }

      return apiData;
    }

    // Otherwise return the entire response data
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);

    // In case of error, try to get data from localStorage
    try {
      const userData = localStorage.getItem("userData");
      if (userData) {
        console.log("Using localStorage data as fallback");
        const parsedData = JSON.parse(userData);
        const userDataObj = parsedData.user || parsedData;

        // Ensure critical profile fields are defined
        return {
          ...userDataObj,
          education: userDataObj.education || "",
          major: userDataObj.major || "",
          interests: userDataObj.interests || [],
          hobbies: userDataObj.hobbies || [],
          studyPreference: userDataObj.studyPreference || "",
          studyGoals: userDataObj.studyGoals || "",
        };
      }
    } catch (localStorageError) {
      console.error("Error reading from localStorage:", localStorageError);
    }

    throw error;
  }
};

export const updateUserProfile = async (userData) => {
  try {
    console.log("Sending profile update to API:", userData);
    const response = await axiosInstance.put("/users/profile", userData);
    console.log("Profile update API response:", response.data);

    // Also update localStorage with the new profile data
    try {
      const localStorageData = localStorage.getItem("userData");
      if (localStorageData) {
        const parsedData = JSON.parse(localStorageData);

        // Update user data in localStorage
        if (parsedData.user) {
          // If userData has nested user object
          parsedData.user = {
            ...parsedData.user,
            ...userData,
            profileCompleted: true, // Ensure profileCompleted is set to true
          };
        } else {
          // If userData is flat
          Object.assign(parsedData, userData, { profileCompleted: true });
        }

        localStorage.setItem("userData", JSON.stringify(parsedData));
        console.log("Updated localStorage with new profile data");
      }
    } catch (localStorageError) {
      console.error("Error updating localStorage:", localStorageError);
    }

    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error);

    // Check if we have a response with error data
    if (error.response?.data) {
      console.error("API error response:", error.response.data);
    }

    // Check if token is expired or invalid
    if (error.response?.status === 401) {
      console.error(
        "Authentication error when updating profile - token may be invalid"
      );
    }

    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await axiosInstance.get("/users");
    return response.data;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
};

export const searchUsers = async (params = {}) => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (params.query) queryParams.append("query", params.query);
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.education) queryParams.append("education", params.education);
    if (params.major) queryParams.append("major", params.major);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
    const response = await axiosInstance.get(`/users/search${queryString}`);
    
    console.log("Search users response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await axiosInstance.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    throw error;
  }
};

export const updateUserStatistics = async (userId, statistics) => {
  try {
    const response = await axiosInstance.put(
      `/users/${userId}/statistics`,
      statistics
    );
    return response.data;
  } catch (error) {
    console.error("Error updating user statistics:", error);
    throw error;
  }
};

export const addRecentActivity = async (userId, activity) => {
  try {
    const response = await axiosInstance.post(
      `/users/${userId}/activities`,
      activity
    );
    return response.data;
  } catch (error) {
    console.error("Error adding recent activity:", error);
    throw error;
  }
};

export const updateLastActive = async () => {
  try {
    const response = await axiosInstance.put("/users/last-active");
    return response.data;
  } catch (error) {
    console.error("Error updating last active status:", error);
    return { error: "Failed to update last active status" };
  }
};

export const getUserFriends = async () => {
  try {
    const response = await axiosInstance.get("/users/friends");
    return response.data;
  } catch (error) {
    console.error("Error fetching friends:", error);
    return { error: "Failed to fetch friends" };
  }
};
