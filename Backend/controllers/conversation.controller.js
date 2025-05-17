const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');

/**
 * Get all conversations for the current user
 */
exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, limit = 20, skip = 0 } = req.query;
    
    // Build query filter
    const filter = {
      "participants.userId": new mongoose.Types.ObjectId(userId),
      isActive: true
    };
    
    // Apply type filter if provided
    if (type && ['DM', 'COMMUNITY', 'STUDY_SESSION'].includes(type)) {
      filter.type = type;
    }
    
    // Get conversations
    const conversations = await Conversation.find(filter)
      .sort({ updatedAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate({
        path: 'participants.userId',
        select: 'name email profileImage lastActive'
      })
      .populate({
        path: 'communityId',
        select: 'name description'
      })
      .populate({
        path: 'studySessionId',
        select: 'title description startTime endTime'
      });
    
    // Count total matching conversations
    const totalCount = await Conversation.countDocuments(filter);
    
    return res.status(200).json({
      success: true,
      conversations,
      totalCount,
      currentPage: Math.floor(skip / limit) + 1,
      totalPages: Math.ceil(totalCount / limit)
    });
    
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: error.message
    });
  }
};

/**
 * Get a specific conversation by ID
 */
exports.getConversationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Verify conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: id,
      "participants.userId": new mongoose.Types.ObjectId(userId),
      isActive: true
    })
    .populate({
      path: 'participants.userId',
      select: 'name email profileImage lastActive'
    })
    .populate({
      path: 'communityId',
      select: 'name description'
    })
    .populate({
      path: 'studySessionId',
      select: 'title description startTime endTime'
    });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or you are not a participant'
      });
    }
    
    return res.status(200).json({
      success: true,
      conversation
    });
    
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching conversation',
      error: error.message
    });
  }
};

/**
 * Create or get DM conversation between current user and target user
 */
exports.getOrCreateDMConversation = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { targetUserId } = req.params;
    
    // Prevent creating conversation with self
    if (currentUserId === targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create conversation with yourself'
      });
    }
    
    // Verify target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found'
      });
    }
    
    // Use static method from model to get or create conversation
    const conversation = await Conversation.getOrCreateDMConversation(
      currentUserId,
      targetUserId
    );
    
    // Populate user details
    await conversation.populate({
      path: 'participants.userId',
      select: 'name email profileImage lastActive'
    });
    
    return res.status(200).json({
      success: true,
      data: conversation
    });
    
  } catch (error) {
    console.error('Error creating/fetching DM conversation:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing conversation request',
      error: error.message
    });
  }
};

/**
 * Update last read timestamp for user in conversation
 */
exports.markConversationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Find the conversation and update the participant's lastReadTimestamp
    const conversation = await Conversation.findOneAndUpdate(
      {
        _id: id,
        "participants.userId": new mongoose.Types.ObjectId(userId),
        isActive: true
      },
      {
        $set: {
          "participants.$.lastReadTimestamp": new Date()
        }
      },
      { new: true }
    );
    
    if (!conversation) {
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
      message: 'Error updating read status',
      error: error.message
    });
  }
}; 