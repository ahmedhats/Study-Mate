import axiosInstance from "./axiosConfig";

export const login = async (credentials) => {
  try {
    const response = await axiosInstance.post("/auth/login", credentials);
    // Return data without modifying localStorage - let the login component handle this
    return response.data;
  } catch (error) {
    console.error("Login API error:", error);
    throw error.response?.data || { message: "Login failed" };
  }
};

export const signup = async (userData) => {
  try {
    const response = await axiosInstance.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    console.error("Signup API error:", error);
    throw error.response?.data || { message: "Registration failed" };
  }
};

export const logout = async () => {
  try {
    await axiosInstance.post("/auth/logout");
  } catch (error) {
    console.error("Logout API error:", error);
  } finally {
    // Always clear userData on logout
    localStorage.removeItem("userData");
  }
};

export const verifyEmail = async (token) => {
  try {
    console.log("Verifying email with token:", token);
    const response = await axiosInstance.get(
      `/auth/verify-email?token=${token}`
    );
    console.log("Verification API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Email verification API error:", error);
    throw error.response?.data || { message: "Email verification failed" };
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await axiosInstance.post("/auth/forgot-password", {
      email,
    });
    return response.data;
  } catch (error) {
    console.error("Forgot password API error:", error);
    throw error.response?.data || { message: "Password reset request failed" };
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await axiosInstance.post("/auth/reset-password", {
      token,
      newPassword,
    });
    return response.data;
  } catch (error) {
    console.error("Reset password API error:", error);
    throw error.response?.data || { message: "Password reset failed" };
  }
};
