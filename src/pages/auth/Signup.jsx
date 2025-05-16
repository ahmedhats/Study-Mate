import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { signup } from "../../services/api/authService";
import { googleLogin } from "../../services/api/authService";
import { googleSignIn } from "../../utils/googleSignIn";
import "../../styles/Auth.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
    general: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {
      username: "",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      birthDate: "",
      general: "",
    };

    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.name) newErrors.name = "Full name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    if (!formData.birthDate) newErrors.birthDate = "Birth date is required";

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    if (
      formData.password &&
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await signup(formData);
      if (response.success) {
        // Clear any existing userData to avoid issues
        localStorage.removeItem("userData");

        // Success message and redirect to login with clear verification instructions
        message.success(
          "Registration successful! Please check your email to verify your account before logging in.",
          5
        );

        // Redirect to login with explicit verification message
        navigate("/login", {
          state: {
            message:
              "Please check your email and verify your account before logging in. You must verify your email before accessing the application.",
          },
        });
      } else {
        if (response.message === "Email or username already exists") {
          setErrors({
            ...errors,
            email: "A user with this email already exists",
            username: "A user with this username already exists",
          });
        } else {
          let friendlyMsg =
            response.message || "Registration failed. Please try again.";
          if (
            response.message &&
            response.message.toLowerCase().includes("timeout")
          ) {
            friendlyMsg =
              "Server is taking too long to respond. Please try again later.";
          } else if (
            response.message &&
            response.message.toLowerCase().includes("network")
          ) {
            friendlyMsg =
              "Network error. Please check your connection and try again.";
          }
          setErrors({
            ...errors,
            general: friendlyMsg,
          });
        }
      }
    } catch (error) {
      const msg = error.message || error.response?.data?.message;
      if (msg === "Email or username already exists") {
        setErrors({
          ...errors,
          email: "A user with this email already exists",
          username: "A user with this username already exists",
        });
      } else if (msg === "Missing Details") {
        setErrors({
          ...errors,
          general: "Please fill in all required fields",
        });
      } else {
        let friendlyMsg = msg;
        if (msg && msg.toLowerCase().includes("timeout")) {
          friendlyMsg =
            "Server is taking too long to respond. Please try again later.";
        } else if (msg && msg.toLowerCase().includes("network")) {
          friendlyMsg =
            "Network error. Please check your connection and try again.";
        } else if (!msg) {
          friendlyMsg = "Registration failed. Please try again.";
        }
        setErrors({
          ...errors,
          general: friendlyMsg,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigate("/login");
  };

  const handleSocialSignin = (provider) => {
    message.info(`${provider} sign-up will be available soon!`);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const idToken = await googleSignIn(
        process.env.REACT_APP_GOOGLE_CLIENT_ID
      );
      const response = await googleLogin(idToken);
      if (response.success) {
        message.success("Google sign up successful!");
        const userData = {
          token: response.token,
          user: {
            ...response.user,
            isAccountVerified: response.user.isAccountVerified === true,
            profileCompleted: response.user.profileCompleted === true,
          },
        };
        localStorage.setItem("userData", JSON.stringify(userData));
        setTimeout(() => {
          if (response.user && response.user.profileCompleted !== true) {
            navigate("/profile-setup", { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
        }, 300);
      } else {
        setErrors((prev) => ({ ...prev, general: response.message }));
      }
    } catch (error) {
      const msg = error.message || error.response?.data?.message;
      setErrors((prev) => ({ ...prev, general: msg }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Create Your Account!</h1>
        <p className="auth-subtitle">Please Enter your details to sign up</p>

        {errors.general && (
          <div className="error-message general-error">{errors.general}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Choose a username"
              className={errors.username ? "error-input" : ""}
            />
            {errors.username && (
              <div className="error-message">{errors.username}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
              className={errors.name ? "error-input" : ""}
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              className={errors.email ? "error-input" : ""}
            />
            {errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Create a password"
                className={errors.password ? "error-input" : ""}
              />
              <span
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              </span>
            </div>
            {errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
                className={errors.confirmPassword ? "error-input" : ""}
              />
            </div>
            {errors.confirmPassword && (
              <div className="error-message">{errors.confirmPassword}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="birthDate">Birth Date</label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              required
              className={errors.birthDate ? "error-input" : ""}
            />
            {errors.birthDate && (
              <div className="error-message">{errors.birthDate}</div>
            )}
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-options">
          <div className="signup-option">
            Already have an account?{" "}
            <span className="auth-link" onClick={navigateToLogin}>
              Sign In
            </span>
          </div>
          <div className="divider">Or</div>
          <div className="social-signin">
            <button
              className="social-button google-button"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <img src="/google-icon.svg" alt="Google" /> Google
            </button>
            <button
              className="social-button apple-button"
              onClick={() => handleSocialSignin("Apple")}
              disabled={loading}
            >
              <img src="/apple-icon.svg" alt="Apple" /> Apple
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
