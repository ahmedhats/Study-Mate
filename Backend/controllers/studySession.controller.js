const StudySession = require('../models/studySession.model');
const { validateObjectId } = require('../utils/validation');

// Get all study sessions
exports.getAllStudySessions = async (req, res) => {
    try {
        const sessions = await StudySession.find({
            status: { $in: ['scheduled', 'active'] },
            isPrivate: false
        })
            .populate('host', 'username name profileImage')
            .populate('participants.user', 'username name profileImage')
            .sort({ startTime: 1 });

        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: "Error fetching study sessions", error: error.message });
    }
};

// Create a new study session
exports.createStudySession = async (req, res) => {
    try {
        const sessionData = {
            ...req.body,
            host: req.user._id,
            participants: [{ user: req.user._id }]
        };

        const session = new StudySession(sessionData);
        await session.save();

        const populatedSession = await StudySession.findById(session._id)
            .populate('host', 'username name profileImage')
            .populate('participants.user', 'username name profileImage');

        res.status(201).json(populatedSession);
    } catch (error) {
        res.status(400).json({ message: "Error creating study session", error: error.message });
    }
};

// Get study session details
exports.getStudySessionDetails = async (req, res) => {
    try {
        const { id } = req.params;

        if (!validateObjectId(id)) {
            return res.status(400).json({ message: "Invalid session ID" });
        }

        const session = await StudySession.findById(id)
            .populate('host', 'username name profileImage')
            .populate('participants.user', 'username name profileImage')
            .populate('chat.user', 'username name profileImage');

        if (!session) {
            return res.status(404).json({ message: "Study session not found" });
        }

        res.json(session);
    } catch (error) {
        res.status(500).json({ message: "Error fetching study session", error: error.message });
    }
};

// Join a study session
exports.joinStudySession = async (req, res) => {
    try {
        const { id } = req.params;

        if (!validateObjectId(id)) {
            return res.status(400).json({ message: "Invalid session ID" });
        }

        const session = await StudySession.findById(id);

        if (!session) {
            return res.status(404).json({ message: "Study session not found" });
        }

        if (session.status !== 'scheduled' && session.status !== 'active') {
            return res.status(400).json({ message: "Cannot join this session" });
        }

        if (session.participants.length >= session.maxParticipants) {
            return res.status(400).json({ message: "Session is full" });
        }

        if (session.isPrivate && req.body.password !== session.password) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const isAlreadyJoined = session.participants.some(
            p => p.user.toString() === req.user._id.toString()
        );

        if (isAlreadyJoined) {
            return res.status(400).json({ message: "Already joined this session" });
        }

        session.participants.push({ user: req.user._id });
        await session.save();

        const updatedSession = await StudySession.findById(id)
            .populate('host', 'username name profileImage')
            .populate('participants.user', 'username name profileImage');

        res.json(updatedSession);
    } catch (error) {
        res.status(500).json({ message: "Error joining study session", error: error.message });
    }
};

// Leave a study session
exports.leaveStudySession = async (req, res) => {
    try {
        const { id } = req.params;

        if (!validateObjectId(id)) {
            return res.status(400).json({ message: "Invalid session ID" });
        }

        const session = await StudySession.findById(id);

        if (!session) {
            return res.status(404).json({ message: "Study session not found" });
        }

        if (session.host.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: "Host cannot leave the session" });
        }

        session.participants = session.participants.filter(
            p => p.user.toString() !== req.user._id.toString()
        );

        await session.save();

        const updatedSession = await StudySession.findById(id)
            .populate('host', 'username name profileImage')
            .populate('participants.user', 'username name profileImage');

        res.json(updatedSession);
    } catch (error) {
        res.status(500).json({ message: "Error leaving study session", error: error.message });
    }
};

// Update study session
exports.updateStudySession = async (req, res) => {
    try {
        const { id } = req.params;

        if (!validateObjectId(id)) {
            return res.status(400).json({ message: "Invalid session ID" });
        }

        const session = await StudySession.findById(id);

        if (!session) {
            return res.status(404).json({ message: "Study session not found" });
        }

        if (session.host.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this session" });
        }

        const updatedSession = await StudySession.findByIdAndUpdate(
            id,
            { ...req.body, updatedAt: Date.now() },
            { new: true, runValidators: true }
        )
            .populate('host', 'username name profileImage')
            .populate('participants.user', 'username name profileImage');

        res.json(updatedSession);
    } catch (error) {
        res.status(400).json({ message: "Error updating study session", error: error.message });
    }
};

// Delete study session
exports.deleteStudySession = async (req, res) => {
    try {
        const { id } = req.params;

        if (!validateObjectId(id)) {
            return res.status(400).json({ message: "Invalid session ID" });
        }

        const session = await StudySession.findById(id);

        if (!session) {
            return res.status(404).json({ message: "Study session not found" });
        }

        if (session.host.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this session" });
        }

        await StudySession.findByIdAndDelete(id);
        res.json({ message: "Study session deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting study session", error: error.message });
    }
}; 