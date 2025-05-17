const StudySession = require('../models/studySession.model');
const { validateObjectId } = require('../utils/validation');
const { createStudySessionConversation, deactivateStudySessionConversation, getConversationByStudySessionId } = require('../services/conversation.service');
const { deleteMessagesForConversation } = require('../services/message.service');

// Helper to get io instance - to avoid circular dependency with server.js
// In a larger app, io might be passed around or set on the app instance.
let ioInstance = null;
const getIoInstance = () => {
    if (!ioInstance) {
        try {
            ioInstance = require('../server').io;
        } catch (e) {
            console.warn("Socket.io instance (io) could not be imported directly in studySession.controller.js. Real-time events for chat end might not be emitted.");
        }
    }
    return ioInstance;
};

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

        // Create a conversation for the study session
        try {
            await createStudySessionConversation(session._id, [req.user._id]);
        } catch (conversationError) {
            // Log the error, but don't fail the entire session creation if conversation hook fails
            // This could be made more robust, e.g., by queuing this or retrying
            console.error(`Failed to create conversation for study session ${session._id}:`, conversationError);
        }

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
        const { id } = req.params; // This is studySessionId

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

        const oldStatus = session.status;
        const newStatus = req.body.status;

        const updatedSession = await StudySession.findByIdAndUpdate(
            id,
            { ...req.body, updatedAt: Date.now() },
            { new: true, runValidators: true }
        )
            .populate('host', 'username name profileImage')
            .populate('participants.user', 'username name profileImage');

        // If session status changed to completed or cancelled, handle conversation cleanup
        if (newStatus && oldStatus !== newStatus && (newStatus === 'completed' || newStatus === 'cancelled')) {
            try {
                const conversation = await getConversationByStudySessionId(id);
                if (conversation) {
                    await deactivateStudySessionConversation(id);
                    await deleteMessagesForConversation(conversation._id);
                    
                    const io = getIoInstance();
                    if (io) {
                        io.to(conversation._id.toString()).emit('SERVER:STUDY_SESSION_CHAT_ENDED', {
                            conversationId: conversation._id.toString(),
                            studySessionId: id,
                            status: newStatus
                        });
                        const socketsInRoom = await io.in(conversation._id.toString()).fetchSockets();
                        socketsInRoom.forEach(socket => socket.leave(conversation._id.toString()));
                    } else {
                        console.warn(`Socket.io instance not available. SERVER:STUDY_SESSION_CHAT_ENDED for ${conversation._id} was not emitted.`);
                    }
                }
            } catch (cleanupError) {
                console.error(`Error cleaning up conversation for study session ${id}:`, cleanupError);
            }
        }

        res.json(updatedSession);
    } catch (error) {
        res.status(400).json({ message: "Error updating study session", error: error.message });
    }
};

// Delete study session
exports.deleteStudySession = async (req, res) => {
    try {
        const { id } = req.params; // This is studySessionId

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
        
        try {
            const conversation = await getConversationByStudySessionId(id);
            if (conversation) {
                await deactivateStudySessionConversation(id);
                await deleteMessagesForConversation(conversation._id);
                
                const io = getIoInstance();
                if (io) {
                    io.to(conversation._id.toString()).emit('SERVER:STUDY_SESSION_CHAT_ENDED', {
                        conversationId: conversation._id.toString(),
                        studySessionId: id,
                        status: 'deleted' 
                    });
                    const socketsInRoom = await io.in(conversation._id.toString()).fetchSockets();
                    socketsInRoom.forEach(socket => socket.leave(conversation._id.toString()));
                } else {
                    console.warn(`Socket.io instance not available. SERVER:STUDY_SESSION_CHAT_ENDED for ${conversation._id} (deleted session) was not emitted.`);
                }
            }
        } catch (cleanupError) {
            console.error(`Error cleaning up conversation for study session ${id} during deletion:`, cleanupError);
        }

        await StudySession.findByIdAndDelete(id);
        res.json({ message: "Study session deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting study session", error: error.message });
    }
}; 