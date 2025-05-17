const Conversation = require("../models/conversation.model");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

/**
 * Get or create a direct message conversation between two users
 * @param {string|ObjectId} userId1 - First user's ID
 * @param {string|ObjectId} userId2 - Second user's ID
 * @returns {Promise<Object>} - The conversation object
 */
async function getOrCreateDMConversation(userId1, userId2) {
  try {
    // Use the static method we defined in the model
    return await Conversation.getOrCreateDMConversation(userId1, userId2);
  } catch (error) {
    console.error("Error creating DM conversation:", error);
    throw error;
  }
}

/**
 * Get all conversations for a specific user
 * @param {string|ObjectId} userId - The user's ID
 * @param {Object} options - Additional options (pagination, filters)
 * @returns {Promise<Array>} - Array of conversation objects
 */
async function getUserConversations(userId, options = {}) {
  try {
    const { limit = 20, skip = 0, type = null } = options;

    // Create base query to find conversations where user is a participant
    let query = {
      "participants.userId": userId,
      isActive: true,
    };

    // Add type filter if specified
    if (type) {
      query.type = type;
    }

    // Get conversations with populated participant info
    const conversations = await Conversation.find(query)
      .populate("participants.userId", "name username") // Only include necessary user fields
      .populate({
        path: "lastMessage.senderId",
        select: "name username",
      })
      .sort({ updatedAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit);

    return conversations;
  } catch (error) {
    console.error("Error fetching user conversations:", error);
    throw error;
  }
}

/**
 * Get a conversation by ID where the user is a participant
 * @param {string|ObjectId} conversationId - The conversation ID
 * @param {string|ObjectId} userId - The user ID
 * @returns {Promise<Object>} - The conversation object
 */
async function getUserConversationById(conversationId, userId) {
  try {
    // Find a conversation by ID where the user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.userId": userId,
    });

    return conversation;
  } catch (error) {
    console.error("Error fetching conversation by ID:", error);
    throw error;
  }
}

/**
 * Add a participant to a conversation
 * @param {string|ObjectId} conversationId - The conversation ID
 * @param {string|ObjectId} userId - The user ID to add
 * @param {boolean} isStudySessionContext - Whether this is a study session context
 * @returns {Promise<Object>} - The updated conversation
 */
async function addParticipantToConversation(
  conversationId,
  userId,
  isStudySessionContext = false
) {
  try {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Check if user is already a participant
    const isParticipant = conversation.participants.some(
      (p) => p.userId.toString() === userId.toString()
    );

    // If user is already a participant, return the conversation
    if (isParticipant) {
      return conversation;
    }

    // For DM conversations, only two participants are allowed
    if (conversation.type === "DM" && conversation.participants.length >= 2) {
      throw new Error("DM conversations cannot have more than 2 participants");
    }

    // Add the new participant
    conversation.participants.push({
      userId,
      joinedAt: new Date(),
      lastReadTimestamp: new Date(),
    });

    // Save and return the updated conversation
    await conversation.save();
    return conversation;
  } catch (error) {
    console.error("Error adding participant to conversation:", error);
    throw error;
  }
}

/**
 * Update a user's last read timestamp for a conversation
 * @param {string|ObjectId} conversationId - The conversation ID
 * @param {string|ObjectId} userId - The user ID
 * @param {Date} timestamp - The timestamp to set (defaults to now)
 * @returns {Promise<Object>} - The updated conversation
 */
async function updateUserLastReadTimestamp(
  conversationId,
  userId,
  timestamp = new Date()
) {
  try {
    // Find the conversation and update the participant's lastReadTimestamp
    const result = await Conversation.findOneAndUpdate(
      {
        _id: conversationId,
        "participants.userId": userId,
      },
      {
        $set: {
          "participants.$.lastReadTimestamp": timestamp,
        },
      },
      { new: true } // Return the updated document
    );

    if (!result) {
      throw new Error(
        "Conversation not found or user is not a participant"
      );
    }

    return result;
  } catch (error) {
    console.error("Error updating last read timestamp:", error);
    throw error;
  }
}

/**
 * Update the lastMessage field of a conversation
 * @param {string|ObjectId} conversationId - The conversation ID
 * @param {Object} messageObject - The message object { text, senderId, timestamp }
 * @returns {Promise<Object>} - The updated conversation
 */
async function updateConversationLastMessage(conversationId, messageObject) {
  try {
    const { text, senderId, timestamp = new Date() } = messageObject;

    const result = await Conversation.findByIdAndUpdate(
      conversationId,
      {
        $set: {
          lastMessage: {
            text,
            senderId,
            timestamp,
          },
        },
      },
      { new: true } // Return the updated document
    );

    if (!result) {
      throw new Error("Conversation not found");
    }

    return result;
  } catch (error) {
    console.error("Error updating conversation last message:", error);
    throw error;
  }
}

/**
 * Create a new conversation for a study session
 * @param {string|ObjectId} studySessionId - The study session ID
 * @param {Array<string|ObjectId>} participantIds - Array of participant user IDs
 * @returns {Promise<Object>} - The created conversation
 */
async function createStudySessionConversation(studySessionId, participantIds) {
  try {
    if (!studySessionId || !participantIds || participantIds.length === 0) {
      throw new Error("Study session ID and at least one participant required");
    }

    // Format participants array with timestamps
    const participants = participantIds.map(userId => ({
      userId,
      joinedAt: new Date(),
      lastReadTimestamp: new Date()
    }));

    // Create the conversation
    const conversation = await Conversation.create({
      type: "STUDY_SESSION",
      studySessionId,
      participants,
      isActive: true
    });

    return conversation;
  } catch (error) {
    console.error("Error creating study session conversation:", error);
    throw error;
  }
}

/**
 * Deactivate a study session conversation when the session ends
 * @param {string|ObjectId} studySessionId - The study session ID
 * @returns {Promise<Object>} - The updated conversation
 */
async function deactivateStudySessionConversation(studySessionId) {
  try {
    const result = await Conversation.findOneAndUpdate(
      { studySessionId, type: "STUDY_SESSION" },
      { $set: { isActive: false } },
      { new: true }
    );
    // TODO: Consider if we need to remove participants or just mark as inactive
    // For now, just marking as inactive. Messages will be deleted separately.
    return result;
  } catch (error) {
    console.error("Error deactivating study session conversation:", error);
    throw error;
  }
}

/**
 * Get a conversation by study session ID
 * @param {string|ObjectId} studySessionId - The study session ID
 * @returns {Promise<Object|null>} - The conversation object or null if not found
 */
async function getConversationByStudySessionId(studySessionId) {
  try {
    const conversation = await Conversation.findOne({
      studySessionId: studySessionId,
      type: "STUDY_SESSION",
    });
    return conversation;
  } catch (error) {
    console.error("Error fetching conversation by study session ID:", error);
    throw error;
  }
}

module.exports = {
  getOrCreateDMConversation,
  getUserConversations,
  getUserConversationById,
  addParticipantToConversation,
  updateUserLastReadTimestamp,
  updateConversationLastMessage,
  createStudySessionConversation,
  deactivateStudySessionConversation,
  getConversationByStudySessionId
}; 