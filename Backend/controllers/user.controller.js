const User = require("../models/user.model");
const FriendRequest = require("../models/friendRequest.model");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { executePythonScript } = require('../utils/pythonBridge');

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
    const { query, page = 1, limit = 10, education, major } = req.query;
    
    // Get the current user ID from the authenticated request
    const currentUserId = req.userId || req.user?._id;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Build the query filter
    const filter = {
      _id: { $ne: currentUserId.toString() }, // Not the current user
    };
    
    // Add search query if provided
    if (query && query.trim() !== "") {
      const searchPattern = new RegExp(query.trim(), "i");
      filter.$or = [
        { name: searchPattern },
        { email: searchPattern },
        { username: searchPattern },
      ];
    }
    
    // Add education filter if provided
    if (education) {
      filter.education = education;
    }
    
    // Add major filter if provided
    if (major) {
      filter.major = major;
    }

    console.log("Search filter:", filter);
    
    // Calculate pagination values
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const pageSize = parseInt(limit);

    // Find users matching the search criteria
    const users = await User.find(filter)
      .select("_id name email major education studyPreference interests hobbies statistics.lastActive")
      .skip(skip)
      .limit(pageSize)
      .sort({ name: 1 });
    
    // Get total count for pagination
    const totalCount = await User.countDocuments(filter);

    console.log(`Found ${users.length} users matching the criteria`);

    // Return matching users
    return res.status(200).json({
      success: true,
      users: users,
      totalCount: totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / pageSize)
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

    // Find the user and populate their friends list with all relevant fields
    const user = await User.findById(userId).populate({
      path: "friends",
      select: "_id name email major interests hobbies education studyPreference statistics.lastActive"
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

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    // Check if users exist
    const [sender, receiver] = await Promise.all([
      User.findById(senderId),
      User.findById(userId)
    ]);

    if (!sender || !receiver) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if already friends
    if (sender.friends.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "Already friends with this user"
      });
    }

    // Check if there's already a pending request
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: userId, status: 'pending' },
        { sender: userId, receiver: senderId, status: 'pending' }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "A friend request already exists between these users"
      });
    }

    // Create new friend request
    const friendRequest = await FriendRequest.create({
      sender: senderId,
      receiver: userId
    });

    return res.status(200).json({
      success: true,
      message: "Friend request sent successfully",
      data: friendRequest
    });
  } catch (error) {
    console.error("Error sending friend request:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send friend request",
      error: error.message
    });
  }
};

// Function to get pending friend requests
module.exports.getPendingRequests = async (req, res) => {
  try {
    const userId = req.userId;

    // Find all pending requests where the current user is the receiver
    const pendingRequests = await FriendRequest.find({
      receiver: userId,
      status: 'pending'
    }).populate('sender', '_id name email major interests hobbies education studyPreference statistics.lastActive');

    return res.status(200).json({
      success: true,
      data: pendingRequests.map(request => ({
        _id: request._id,
        sender: request.sender
      }))
    });
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending requests",
      error: error.message
    });
  }
};

// Function to get sent friend requests
module.exports.getSentRequests = async (req, res) => {
  try {
    const userId = req.userId;

    // Find all pending requests where the current user is the sender
    const sentRequests = await FriendRequest.find({
      sender: userId,
      status: 'pending'
    }).populate('receiver', '_id name email major interests hobbies education studyPreference statistics.lastActive');

    return res.status(200).json({
      success: true,
      data: sentRequests.map(request => request.receiver)
    });
  } catch (error) {
    console.error("Error fetching sent requests:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sent requests",
      error: error.message
    });
  }
};

// Function to accept a friend request
module.exports.acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const userId = req.userId;

    // Find the friend request
    const friendRequest = await FriendRequest.findOne({
      _id: requestId,
      receiver: userId,
      status: 'pending'
    }).populate('sender');

    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found"
      });
    }

    // Update request status
    friendRequest.status = 'accepted';
    await friendRequest.save();

    // Add each user to the other's friends list
    await Promise.all([
      User.findByIdAndUpdate(userId, { 
        $addToSet: { friends: friendRequest.sender._id } 
      }),
      User.findByIdAndUpdate(friendRequest.sender._id, { 
        $addToSet: { friends: userId } 
      })
    ]);

    return res.status(200).json({
      success: true,
      message: "Friend request accepted",
      data: friendRequest.sender
    });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to accept friend request",
      error: error.message
    });
  }
};

// Function to reject a friend request
module.exports.rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const userId = req.userId;

    // Find and update the friend request
    const friendRequest = await FriendRequest.findOne({
      _id: requestId,
      receiver: userId,
      status: 'pending'
    });

    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found"
      });
    }

    // Update request status
    friendRequest.status = 'rejected';
    await friendRequest.save();

    return res.status(200).json({
      success: true,
      message: "Friend request rejected"
    });
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reject friend request",
      error: error.message
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

// Function to cancel a sent friend request
module.exports.cancelFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body;
    const senderId = req.userId;

    // Find and delete the friend request
    const friendRequest = await FriendRequest.findOneAndDelete({
      sender: senderId,
      receiver: userId,
      status: 'pending'
    });

    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Friend request canceled successfully"
    });
  } catch (error) {
    console.error("Error canceling friend request:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel friend request",
      error: error.message
    });
  }
};

// Get recommended friends
module.exports.getRecommendedFriends = async (req, res, next) => {
  try {
    const userId = req.userId;

    // Get the current user from database
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(httpStatus.NOT_FOUND).json({
        error: 'User not found'
      });
    }

    // Get pending friend requests sent to the current user
    const pendingRequests = await FriendRequest.find({
      receiver: userId,
      status: 'pending'
    });

    // Get IDs of users who have sent requests
    const usersSentRequests = pendingRequests.map(request => request.sender);

    // Get all users except:
    // 1. Current user
    // 2. Their friends
    // 3. Users who have sent them friend requests
    const otherUsers = await User.find({
      _id: { 
        $ne: userId, // not the current user
        $nin: [...currentUser.friends, ...usersSentRequests] // not friends and not users who sent requests
      }
    }).select('name email major interests hobbies education studyPreference');

    try {
      // Prepare input for the Python script
      const pythonInput = {
        user_list: otherUsers.map(user => ({
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          major: user.major || "",
          interests: user.interests || [],
          hobbies: user.hobbies || [],
          education: user.education || "",
          studyPreference: user.studyPreference || ""
        })),
        target_user: {
          _id: currentUser._id.toString(),
          name: currentUser.name,
          email: currentUser.email,
          major: currentUser.major || "",
          interests: currentUser.interests || [],
          hobbies: currentUser.hobbies || [],
          education: currentUser.education || "",
          studyPreference: currentUser.studyPreference || ""
        },
        top_n: 10
      };

      console.log('Attempting to use Python matching algorithm...');
      // Try to execute the Python matching script
      const results = await executePythonScript('user_matcher.py', pythonInput);
      console.log('Successfully used Python matching algorithm');
      console.log('Python script results:', results);
      
      return res.status(httpStatus.OK).json({
        ...results,
        matchingMethod: 'python'
      });
    } catch (pythonError) {
      console.error('Python script execution failed:', pythonError);
      console.log('Falling back to JavaScript matching algorithm...');
      
      // Fallback to basic matching logic if Python script fails
      const matches = otherUsers.map(user => {
        // Calculate a basic match percentage based on common attributes
        let matchScore = 0;
        let totalFactors = 0;

        // Major match (30%)
        if (user.major && currentUser.major && user.major === currentUser.major) {
          matchScore += 30;
        }
        totalFactors += 30;

        // Education match (20%)
        if (user.education && currentUser.education && user.education === currentUser.education) {
          matchScore += 20;
        }
        totalFactors += 20;

        // Study preference match (10%)
        if (user.studyPreference && currentUser.studyPreference && user.studyPreference === currentUser.studyPreference) {
          matchScore += 10;
        }
        totalFactors += 10;

        // Interests overlap (25%)
        if (user.interests?.length && currentUser.interests?.length) {
          const commonInterests = user.interests.filter(interest => 
            currentUser.interests.includes(interest)
          );
          const interestScore = (commonInterests.length / Math.max(user.interests.length, currentUser.interests.length)) * 25;
          matchScore += interestScore;
        }
        totalFactors += 25;

        // Hobbies overlap (15%)
        if (user.hobbies?.length && currentUser.hobbies?.length) {
          const commonHobbies = user.hobbies.filter(hobby => 
            currentUser.hobbies.includes(hobby)
          );
          const hobbyScore = (commonHobbies.length / Math.max(user.hobbies.length, currentUser.hobbies.length)) * 15;
          matchScore += hobbyScore;
        }
        totalFactors += 15;

        // Calculate final percentage
        const matchPercentage = totalFactors > 0 ? (matchScore / totalFactors) * 100 : 0;

        return {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            major: user.major,
            interests: user.interests,
            hobbies: user.hobbies,
            education: user.education,
            studyPreference: user.studyPreference
          },
          matchPercentage
        };
      });

      // Sort by match percentage in descending order
      matches.sort((a, b) => b.matchPercentage - a.matchPercentage);

      return res.status(httpStatus.OK).json({ 
        matches: matches.slice(0, 10),
        matchingMethod: 'javascript'
      });
    }
  } catch (error) {
    console.error('Error in getRecommendedFriends:', error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to get recommended friends',
      details: error.message
    });
  }
};
