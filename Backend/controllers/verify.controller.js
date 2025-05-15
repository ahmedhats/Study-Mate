const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

module.exports.verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Verification token is missing" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      console.error("JWT Verification error:", jwtError);
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    // Handle different token structures (id or email-based tokens)
    const userQuery = decoded.id
      ? { _id: decoded.id }
      : { email: decoded.email };

    const user = await User.findOne(userQuery);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // If already verified, return success but with already verified message
    if (user.isAccountVerified) {
      return res.status(200).json({
        success: true,
        message: "Account already verified",
        token: token, // Include token for frontend authentication
        isAccountVerified: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isAccountVerified: true,
          profileCompleted: user.profileCompleted || false,
        },
      });
    }

    // Update user verification status
    user.isAccountVerified = true;
    await user.save();

    // Generate new authentication token for the user
    const authToken = jwt.sign(
      { id: user._id, isAccountVerified: true },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return success response with user data and token
    res.status(200).json({
      success: true,
      message: "Account verified successfully",
      token: authToken, // Include fresh token for authentication
      isAccountVerified: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAccountVerified: true,
        profileCompleted: user.profileCompleted || false,
      },
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message:
        "Email verification failed. Please try again or request a new verification link.",
    });
  }
};
