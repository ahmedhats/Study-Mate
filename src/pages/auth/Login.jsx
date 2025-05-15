import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { message } from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { login } from "../../services/api/authService";
import "../../styles/Auth.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Check for verification message from redirect
  useEffect(() => {
    // If the URL is malformed and has /login/login, redirect to just /login
    if (location.pathname.endsWith("/login/login")) {
      navigate("/login", { replace: true, state: location.state });
      return;
    }

    if (location.state?.message) {
      setErrors((prev) => ({
        ...prev,
        general: location.state.message,
      }));
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user starts typing
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Helper for showing error messages
  const showLoginError = (msg) => {
    if (msg === "Invalid email or password") {
      setErrors({
        email: "Incorrect email or password",
        password: "Incorrect email or password",
        general: "",
      });
    } else if (
      msg === "Please verify your email address" ||
      msg === "Email not verified"
    ) {
      setErrors({
        email: "",
        password: "",
        general:
          "Please verify your email address before logging in. Check your inbox for the verification link.",
      });
    } else if (msg === "Email and Password are required") {
      setErrors({
        email: "Email is required",
        password: "Password is required",
        general: "",
      });
    } else {
      setErrors({
        email: "",
        password: "",
        general: msg || "Login failed. Please try again.",
      });
    }
  };

  // Simple client-side validation for email format
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    // Reset errors
    setErrors({ email: "", password: "", general: "" });

    // Client-side validation
    if (!formData.email || !formData.password) {
      showLoginError("Email and Password are required");
      return;
    }
    if (!isValidEmail(formData.email)) {
      setErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address",
      }));
      return;
    }

    setLoading(true);
    try {
      // Clear any existing userData to prevent conflicts
      localStorage.removeItem("userData");

      const response = await login({
        email: formData.email,
        password: formData.password,
      });

      console.log("Login response:", response);

      if (response.success) {
        // STRICT VERIFICATION CHECK: Prevent unverified users from proceeding
        if (response.user && !response.user.isAccountVerified) {
          setErrors({
            email: "",
            password: "",
            general:
              "Please verify your email before logging in. Check your inbox for the verification link.",
          });
          setLoading(false);
          return;
        }

        message.success("Login successful!");

        // Create userData object with verification and profile info
        const userData = {
          token: response.token,
          user: {
            ...response.user,
            isAccountVerified: response.user.isAccountVerified === true,
            profileCompleted: response.user.profileCompleted === true,
          },
        };

        // Store the user data in localStorage - make sure it's saved before navigation
        console.log("Saving userData to localStorage:", userData);
        localStorage.setItem("userData", JSON.stringify(userData));

        // Force a small delay to ensure localStorage is updated
        setTimeout(() => {
          // Navigate based on profile completion status
          if (response.user && response.user.profileCompleted !== true) {
            console.log("Profile not completed, redirecting to profile setup");
            // Navigate to profile setup - user is verified but profile not complete
            navigate("/profile-setup", { replace: true });
          } else {
            console.log("Profile completed, redirecting to dashboard");
            // Returning user with completed profile - go directly to dashboard
            navigate("/dashboard", { replace: true });
          }
        }, 300);
      } else {
        showLoginError(response.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      const msg = error.message || error.response?.data?.message;
      showLoginError(msg);
    } finally {
      setLoading(false);
    }
  };

  const navigateToSignup = () => {
    navigate("/signup");
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  const handleSocialSignin = (provider) => {
    message.info(`${provider} sign-in will be available soon!`);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Welcome Back!</h1>
        <p className="auth-subtitle">Please Enter your details to sign in</p>

        {errors.general && (
          <div className="error-message general-error">{errors.general}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
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
                placeholder="Enter your password"
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

          <div className="form-options">
            <label className="remember-me">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              Remember me
            </label>
            <span className="forgot-password" onClick={handleForgotPassword}>
              Forgot password?
            </span>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-options">
          <div className="signup-option">
            Don't have an account?{" "}
            <span className="auth-link" onClick={navigateToSignup}>
              Sign Up
            </span>
          </div>
          <div className="divider">Or</div>
          <div className="social-signin">
            <button
              className="social-button google-button"
              onClick={() => handleSocialSignin("Google")}
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

export default Login;
