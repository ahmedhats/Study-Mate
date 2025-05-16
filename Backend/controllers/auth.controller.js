const User = require("../models/user.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  verificationEmailTemplate,
} = require("../utils/templates/verifyEmail.template");
const { sendEmail } = require("../utils/sendEmail");
const crypto = require("crypto");

module.exports.register = async (req, res) => {
  const { username, name, email, password, birthDate } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email or username already exists.",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      name,
      email,
      password: hashedPassword,
      birthDate,
      isAccountVerified: false,
    });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    const subject = "Verify your email address";
    const verificationLink = `${process.env.FRONTEND_URL}#/verify-email?token=${token}`;
    const template = verificationEmailTemplate(verificationLink, user.name);
    try {
      await sendEmail(user.email, subject, template);
    } catch (emailError) {
      // Log only for server, not for user
      console.error("Email sending failed");
    }
    return res.status(201).json({
      success: true,
      message:
        "Registration successful. Please check your email to verify your account.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    // Handle DB connection or timeout errors
    console.error("Registration error:", error.message);
    return res.status(500).json({
      success: false,
      message:
        "Sorry, we are experiencing technical difficulties. Please try again later.",
    });
  }
};

module.exports.login = async (req, res) => {
  const user = req.user;
  try {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAccountVerified: user.isAccountVerified,
        profileCompleted: user.profileCompleted || false,
      },
    });
  } catch (error) {
    // Handle DB connection or timeout errors
    console.error("Login error:", error.message);
    return res.status(500).json({
      success: false,
      message:
        "Sorry, we are experiencing technical difficulties. Please try again later.",
    });
  }
};

module.exports.logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res
      .status(200)
      .json({ success: true, message: "User Logged out successfully" });
  } catch (error) {
    console.error("Logout error");
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

module.exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const subject = "Password Reset Request";
    const template = `
            <h1>Password Reset Request</h1>
            <p>You requested a password reset. Click the link below to reset your password:</p>
            <a href="${resetUrl}">Reset Password</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
        `;

    await sendEmail(user.email, subject, template);

    return res.status(200).json({
      success: true,
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    console.error("Password reset request error");
    return res.status(500).json({
      success: false,
      message: "Error processing password reset request",
    });
  }
};

module.exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Password reset token is invalid or has expired",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Password reset error");
    return res.status(500).json({
      success: false,
      message: "Error resetting password",
    });
  }
};
