const User = require('../models/user.model');
const StudySession = require('../models/studySession.model');
const Task = require('../models/task.model');

// Get user statistics
exports.getUserStats = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Get completed tasks count
        const completedTasks = await Task.countDocuments({
            createdBy: req.user._id,
            status: 'completed'
        });

        // Get total study time from study sessions
        const studySessions = await StudySession.find({
            host: req.user._id,
            status: 'completed'
        });

        const totalStudyTime = studySessions.reduce((total, session) => {
            const duration = (session.endTime - session.startTime) / (1000 * 60); // Convert to minutes
            return total + duration;
        }, 0);

        // Calculate study streak
        const today = new Date();
        const streak = user.statistics.studyStreak;

        res.json({
            totalStudyTime: Math.round(totalStudyTime),
            completedTasks,
            studyStreak: streak,
            weeklyGoal: user.statistics.weeklyGoal,
            weeklyProgress: user.statistics.totalHours
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching user statistics", error: error.message });
    }
};

// Get study history
exports.getStudyHistory = async (req, res) => {
    try {
        const { period } = req.query;
        const startDate = new Date();

        switch (period) {
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case 'year':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            default:
                startDate.setDate(startDate.getDate() - 7);
        }

        const studySessions = await StudySession.find({
            host: req.user._id,
            startTime: { $gte: startDate },
            status: 'completed'
        }).sort({ startTime: 1 });

        const history = studySessions.map(session => ({
            date: session.startTime,
            duration: (session.endTime - session.startTime) / (1000 * 60), // Convert to minutes
            subject: session.subject
        }));

        res.json(history);
    } catch (error) {
        res.status(500).json({ message: "Error fetching study history", error: error.message });
    }
};

// Get study distribution
exports.getStudyDistribution = async (req, res) => {
    try {
        const studySessions = await StudySession.find({
            host: req.user._id,
            status: 'completed'
        });

        const distribution = studySessions.reduce((acc, session) => {
            const subject = session.subject;
            const duration = (session.endTime - session.startTime) / (1000 * 60); // Convert to minutes

            if (!acc[subject]) {
                acc[subject] = 0;
            }
            acc[subject] += duration;

            return acc;
        }, {});

        res.json(distribution);
    } catch (error) {
        res.status(500).json({ message: "Error fetching study distribution", error: error.message });
    }
};

// Update user statistics
exports.updateUserStats = async (req, res) => {
    try {
        const { weeklyGoal } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { 'statistics.weeklyGoal': weeklyGoal },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user.statistics);
    } catch (error) {
        res.status(500).json({ message: "Error updating user statistics", error: error.message });
    }
}; 