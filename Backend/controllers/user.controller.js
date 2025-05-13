const User = require('../models/user.model');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

// Get user by ID
module.exports.getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password -resetPasswordToken -resetPasswordExpires')
            .populate('friends', 'name email profileImage')
            .populate('teams', 'name description');

        if (!user) {
            throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
        }

        res.status(httpStatus.OK).json(user);
    } catch (error) {
        next(error);
    }
};

// Get all users with pagination and filtering
module.exports.getAllUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, education, major, studyPreference } = req.query;
        const query = {};

        if (education) query.education = education;
        if (major) query.major = major;
        if (studyPreference) query.studyPreference = studyPreference;

        const users = await User.find(query)
            .select('-password -resetPasswordToken -resetPasswordExpires')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await User.countDocuments(query);

        res.status(httpStatus.OK).json({
            users,
            totalPages: Math.ceil(count / limit),
            currentPage: page
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
            studyPreference
        } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Email or username already exists');
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
            studyPreference: studyPreference || 'evening'
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
                runValidators: true
            }
        ).select('-password -resetPasswordToken -resetPasswordExpires');

        if (!user) {
            throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
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
            throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
        }

        res.status(httpStatus.OK).json({ message: 'User deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// Search users
module.exports.searchUsers = async (req, res, next) => {
    try {
        const { query, education, major, studyPreference } = req.query;
        const searchQuery = {};

        if (query) {
            searchQuery.$or = [
                { name: { $regex: query, $options: 'i' } },
                { username: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ];
        }

        if (education) searchQuery.education = education;
        if (major) searchQuery.major = major;
        if (studyPreference) searchQuery.studyPreference = studyPreference;

        const users = await User.find(searchQuery)
            .select('-password -resetPasswordToken -resetPasswordExpires')
            .limit(20);

        res.status(httpStatus.OK).json(users);
    } catch (error) {
        next(error);
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
                    'statistics.totalHours': totalHours,
                    'statistics.completedTasks': completedTasks,
                    'statistics.studyStreak': studyStreak,
                    'statistics.weeklyGoal': weeklyGoal
                }
            },
            { new: true }
        ).select('-password -resetPasswordToken -resetPasswordExpires');

        if (!user) {
            throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
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
                        timestamp: new Date()
                    }
                }
            },
            { new: true }
        ).select('-password -resetPasswordToken -resetPasswordExpires');

        if (!user) {
            throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
        }

        res.status(httpStatus.OK).json(user);
    } catch (error) {
        next(error);
    }
};