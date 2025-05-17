const express = require("express");
const router = express.Router();
const { auth } = require('../middlewares/auth.middleware');
const Message = require('../models/message.model');
const Conversation = require('../models/conversation.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');

/**
 * @route GET /api/conversations
 * @desc Get user's conversations (DMs, Communities, Study Sessions)
 * @access Private
 */
router.get("/conversations", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all conversations the user is part of
    const conversations = await Conversation.find({ 'participants.userId': userId })
      .populate('participants.userId', 'name email avatar')
      .sort({ updatedAt: -1 })
      .exec();
    
    return res.status(200).json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Error getting conversations:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching conversations'
    });
  }
});

/**
 * @route GET /api/conversations/:conversationId/messages
 * @desc Get messages for a specific conversation
 * @access Private
 */
router.get("/conversations/:conversationId/messages", auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;
    
    // Verify user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      'participants.userId': userId
    });
    
    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this conversation'
      });
    }
    
    // Get messages, newest first
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
    
    return res.status(200).json({
      success: true,
      data: messages.reverse() // Return in chronological order
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching messages'
    });
  }
});

/**
 * @route POST /api/conversations/:id/messages
 * @desc Send a message to a conversation
 * @access Private
 */
router.post("/conversations/:conversationId/messages", auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    // Validate request
    if (!content || !content.text) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }
    
    // Verify user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      'participants.userId': userId
    });
    
    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this conversation'
      });
    }
    
    // Get user info for the message
    const user = await User.findById(userId);
    
    // Create message
    const message = new Message({
      conversationId,
      senderId: userId,
      senderName: user.name,
      senderAvatar: user.avatar || null,
      content
    });
    
    await message.save();
    
    // Update conversation with last message info
    conversation.lastMessage = {
      text: content.text,
      senderId: userId,
      senderName: user.name,
      timestamp: new Date()
    };
    
    await conversation.save();
    
    return res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
});

/**
 * @route POST /api/conversations/dm/:userId
 * @desc Get or create DM conversation with another user
 * @access Private
 */
router.post("/conversations/dm/:userId", auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.userId;
    
    // Check if users are different
    if (currentUserId === targetUserId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot create a conversation with yourself' 
      });
    }
    
    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Target user not found' 
      });
    }
    
    // Find existing DM conversation between these users
    const existingConversation = await Conversation.findOne({
      type: 'DM',
      participants: {
        $all: [
          { $elemMatch: { userId: currentUserId } },
          { $elemMatch: { userId: targetUserId } }
        ]
      }
    }).populate('participants.userId', 'name email avatar');
    
    if (existingConversation) {
      return res.status(200).json({
        success: true,
        data: existingConversation
      });
    }
    
    // Create new DM conversation
    const newConversation = new Conversation({
      type: 'DM',
      participants: [
        { userId: currentUserId, lastReadTimestamp: new Date() },
        { userId: targetUserId, lastReadTimestamp: new Date() }
      ]
    });
    
    await newConversation.save();
    
    // Populate user info
    await newConversation.populate('participants.userId', 'name email avatar');
    
    return res.status(201).json({
      success: true,
      data: newConversation
    });
  } catch (error) {
    console.error('Error creating/getting DM conversation:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing conversation request'
    });
  }
});

/**
 * @route POST /api/conversations/:conversationId/read
 * @desc Mark conversation as read (update last read timestamp)
 * @access Private
 */
router.post("/conversations/:conversationId/read", auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    
    // Update the user's last read timestamp
    const result = await Conversation.updateOne(
      { 
        _id: conversationId, 
        'participants.userId': userId 
      },
      { 
        $set: { 'participants.$.lastReadTimestamp': new Date() } 
      }
    );
    
    if (result.nModified === 0) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or you are not a participant'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Conversation marked as read'
    });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating read status'
    });
  }
});

/**
 * @route POST /api/conversations/study-session/:sessionId
 * @desc Create a new study session conversation
 * @access Private
 */
router.post("/conversations/study-session/:sessionId", auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { participantIds } = req.body;
    
    // Ensure the current user is included
    if (!participantIds.includes(req.user.id)) {
      participantIds.push(req.user.id);
    }
    
    // Create study session conversation
    const conversation = new Conversation({
      type: 'STUDY_SESSION',
      studySessionId: sessionId,
      participants: participantIds.map(id => ({
        userId: id,
        lastReadTimestamp: new Date()
      })),
    });
    
    await conversation.save();
    await conversation.populate('participants.userId', 'name email avatar');
    
    return res.status(201).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Error creating study session conversation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create study session conversation',
      error: error.message,
    });
  }
});

/**
 * @route DELETE /api/conversations/study-session/:sessionId
 * @desc Deactivate study session conversation when session ends
 * @access Private
 */
router.delete("/conversations/study-session/:sessionId", auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Find and update the conversation to inactive
    const result = await Conversation.updateOne(
      { studySessionId: sessionId, type: 'STUDY_SESSION' },
      { $set: { isActive: false } }
    );
    
    if (result.nModified === 0) {
      return res.status(404).json({
        success: false,
        message: 'Study session conversation not found'
      });
    }
    
    return res.json({
      success: true,
      message: 'Study session conversation deactivated'
    });
  } catch (error) {
    console.error('Error deactivating study session conversation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to deactivate study session conversation'
    });
  }
});

/**
 * @route DELETE /api/messages/all
 * @desc Delete all messages (USE WITH CAUTION)
 * @access Private
 */
router.delete("/messages/all", auth, async (req, res) => {
  try {
    // Delete all messages
    await Message.deleteMany({});
    
    // Update all conversations to remove last message
    await Conversation.updateMany({}, { $set: { lastMessage: null } });
    
    return res.status(200).json({
      success: true,
      message: 'All messages have been deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting all messages:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting messages'
    });
  }
});

module.exports = router; 