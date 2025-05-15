const User = require("../models/user.model");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");

// Get user by ID
module.exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .populate("friends", "name email profileImage")
      .populate("teams", "name description");

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    res.status(httpStatus.OK).json(user);
  } catch (error) {
    next(error);
  }
};

// Get all users with pagination and filtering
module.exports.getAllUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      education,
      major,
      studyPreference,
    } = req.query;
    const query = {};

    if (education) query.education = education;
    if (major) query.major = major;
    if (studyPreference) query.studyPreference = studyPreference;

    const users = await User.find(query)
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.status(httpStatus.OK).json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
};

// Create new user
module.exports.createUser = async (req, res, next) => {
  try {
    const {
      username,
      name,
      email,
      password,
      education,
      major,
      interests,
      hobbies,
      studyPreference,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Email or username already exists"
      );
    }

    const user = await User.create({
      username,
      name,
      email,
      password,
      education,
      major,
      interests: interests || [],
      hobbies: hobbies || [],
      studyPreference: studyPreference || "evening",
    });

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.resetPasswordToken;
    delete userResponse.resetPasswordExpires;

    res.status(httpStatus.CREATED).json(userResponse);
  } catch (error) {
    next(error);
  }
};

// Update user
module.exports.updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;

    // Remove sensitive fields from update
    delete updateData.password;
    delete updateData.resetPasswordToken;
    delete updateData.resetPasswordExpires;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password -resetPasswordToken -resetPasswordExpires");

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    res.status(httpStatus.OK).json(user);
  } catch (error) {
    next(error);
  }
};

// Delete user
module.exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    res.status(httpStatus.OK).json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Search users
module.exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    // Get the current user ID from the authenticated request
    const currentUserId = req.userId || req.user?._id;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Create a regex pattern for case-insensitive search
    const searchPattern = new RegExp(query.trim(), "i");

    console.log(`Searching for pattern: ${searchPattern}`);
    console.log(`Current user ID: ${currentUserId}`);

    // Find users matching the search criteria
    // Exclude the current user from results
    const users = await User.find({
      $and: [
        { _id: { $ne: currentUserId.toString() } }, // Not the current user
        {
          $or: [
            { name: searchPattern },
            { email: searchPattern },
            { username: searchPattern },
            { major: searchPattern },
          ],
        },
      ],
    }).select("_id name email major statistics.lastActive");

    console.log(`Found ${users.length} users matching the search pattern`);

    // Return matching users
    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error searching users:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search users",
      error: error.message,
    });
  }
};

// Update user statistics
module.exports.updateUserStatistics = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { totalHours, completedTasks, studyStreak, weeklyGoal } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "statistics.totalHours": totalHours,
          "statistics.completedTasks": completedTasks,
          "statistics.studyStreak": studyStreak,
          "statistics.weeklyGoal": weeklyGoal,
        },
      },
      { new: true }
    ).select("-password -resetPasswordToken -resetPasswordExpires");

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    res.status(httpStatus.OK).json(user);
  } catch (error) {
    next(error);
  }
};

// Add recent activity
module.exports.addRecentActivity = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { type, description } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          recentActivities: {
            type,
            description,
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    ).select("-password -resetPasswordToken -resetPasswordExpires");

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    res.status(httpStatus.OK).json(user);
  } catch (error) {
    next(error);
  }
};

// Update own profile (for /users/profile)
module.exports.updateOwnProfile = async (req, res, next) => {
  try {
    console.log("updateOwnProfile called");
    console.log("req.user:", req.user);
    console.log("req.body:", req.body);
    const userId = req.user._id;
    const updateData = req.body;

    // Remove sensitive fields from update
    delete updateData.password;
    delete updateData.resetPasswordToken;
    delete updateData.resetPasswordExpires;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password -resetPasswordToken -resetPasswordExpires");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// Get own profile (for /users/profile)
module.exports.getOwnProfile = async (req, res, next) => {
  try {
    // Get user ID from either userId or req.user._id depending on what's available
    const userId = req.userId || (req.user && req.user._id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    console.log("Fetching profile for user:", userId);

    const user = await User.findById(userId).select(
      "-password -resetPasswordToken -resetPasswordExpires"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("User profile data found:", user);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error in getOwnProfile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
      error: error.message,
    });
  }
};

// Update the user's last active timestamp
module.exports.updateLastActive = async (req, res) => {
  try {
    const userId = req.user._id;

    await User.findByIdAndUpdate(userId, {
      "statistics.lastActive": new Date(),
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error updating last active status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update last active status",
    });
  }
};

// Get a user's friends with online status
module.exports.getUserFriends = async (req, res) => {
  try {
    const userId = req.userId;

    // Find the user and populate their friends list
    const user = await User.findById(userId).populate({
      path: "friends",
      select: "_id name email major statistics.lastActive",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user.friends,
    });
  } catch (error) {
    console.error("Error fetching friends:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch friends",
      error: error.message,
    });
  }
};

// Function to send a friend request
module.exports.sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body;
    const senderId = req.userId;

    console.log("Friend request params:", { userId, senderId });

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check if users exist
    const [sender, receiver] = await Promise.all([
      User.findById(senderId),
      User.findById(userId),
    ]);

    if (!sender || !receiver) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already friends
    if (sender.friends.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "Already friends with this user",
      });
    }

    // In a real implementation, we would create a friend request record
    // For now, we'll just return success

    return res.status(200).json({
      success: true,
      message: "Friend request sent successfully",
    });
  } catch (error) {
    console.error("Error sending friend request:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send friend request",
      error: error.message,
    });
  }
};

// Function to accept a friend request
module.exports.acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const userId = req.userId;

    console.log("Accept friend request params:", { requestId, userId });

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: "Request ID is required",
      });
    }

    // In a real implementation, this would verify the request exists
    // For now, we'll update both users' friends lists

    // Add each user to the other's friends list
    await User.findByIdAndUpdate(userId, { $addToSet: { friends: requestId } });
    await User.findByIdAndUpdate(requestId, { $addToSet: { friends: userId } });

    return res.status(200).json({
      success: true,
      message: "Friend request accepted",
    });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to accept friend request",
      error: error.message,
    });
  }
};

// Function to reject a friend request
module.exports.rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;

    console.log("Reject friend request params:", { requestId });

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: "Request ID is required",
      });
    }

    // In a real implementation, this would find and delete the request
    // For now, we'll just return success

    return res.status(200).json({
      success: true,
      message: "Friend request rejected",
    });
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reject friend request",
      error: error.message,
    });
  }
};

// Function to remove a friend
module.exports.removeFriend = async (req, res) => {
  try {
    const friendId = req.params.userId;
    const userId = req.userId;

    if (!friendId) {
      return res.status(400).json({
        success: false,
        message: "Friend ID is required",
      });
    }

    // Remove each user from the other's friends list
    await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });

    await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });

    return res.status(200).json({
      success: true,
      message: "Friend removed successfully",
    });
  } catch (error) {
    console.error("Error removing friend:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove friend",
      error: error.message,
    });
  }
};

// Function to get pending friend requests
module.exports.getPendingRequests = async (req, res) => {
  try {
    const userId = req.userId;

    // In a real implementation, this would query a FriendRequest collection
    // For now, we'll return mock data to work with the frontend

    // Mock pending requests data
    const pendingRequests = [
      {
        _id: "pending1",
        name: "Alice Johnson",
        email: "alice@example.com",
        major: "computer_science",
        statistics: { lastActive: new Date(Date.now() - 45 * 60000) },
      },
      {
        _id: "pending2",
        name: "Bob Smith",
        email: "bob@example.com",
        major: "physics",
        statistics: { lastActive: new Date(Date.now() - 120 * 60000) },
      },
    ];

    return res.status(200).json({
      success: true,
      data: pendingRequests,
    });
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending requests",
      error: error.message,
    });
  }
};

// Function to get sent friend requests
module.exports.getSentRequests = async (req, res) => {
  try {
    const userId = req.userId;

    // In a real implementation, this would query a FriendRequest collection
    // For now, we'll return mock data to work with the frontend

    // Mock sent requests data
    const sentRequests = [
      {
        _id: "sent1",
        name: "Carol Williams",
        email: "carol@example.com",
        major: "mathematics",
        statistics: { lastActive: new Date(Date.now() - 5 * 60000) },
      },
    ];

    return res.status(200).json({
      success: true,
      data: sentRequests,
    });
  } catch (error) {
    console.error("Error fetching sent requests:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sent requests",
      error: error.message,
    });
  }
};
