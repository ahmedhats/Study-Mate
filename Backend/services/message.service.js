const Message = require("../models/message.model");
const Conversation = require("../models/conversation.model");
const conversationService = require("./conversation.service");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

/**
 * Save a new message to the database
 * @param {string|ObjectId} conversationId - The conversation ID
 * @param {string|ObjectId} senderId - The sender's user ID
 * @param {Object} content - Message content { type, text }
 * @returns {Promise<Object>} - The created message object
 */
async function saveMessage(conversationId, senderId, content) {
  try {
    // Validate the conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.userId": senderId,
    });

    if (!conversation) {
      throw new Error("Conversation not found or user is not a participant");
    }

    // Structure content correctly
    const messageContent = {
      type: content.type || "TEXT",
      text: content.text,
    };

    // Create the message
    const message = await Message.createMessage(
      conversationId,
      senderId,
      messageContent
    );

    // Update the conversation's lastMessage field
    await conversationService.updateConversationLastMessage(conversationId, {
      text: messageContent.text,
      senderId,
      timestamp: message.timestamp,
    });

    // Return the created message
    return message;
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }
}

/**
 * Get messages for a specific conversation
 * @param {string|ObjectId} conversationId - The conversation ID
 * @param {Object} options - Pagination options { limit, before, after }
 * @returns {Promise<Array>} - Array of message objects
 */
async function getMessagesForConversation(conversationId, options = {}) {
  try {
    // Validate conversation exists
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Use the static method from the model to get messages
    const messages = await Message.getMessagesForConversation(
      conversationId,
      options
    );

    return messages;
  } catch (error) {
    console.error("Error getting messages for conversation:", error);
    throw error;
  }
}

/**
 * Delete all messages for a specific conversation (used for study sessions)
 * @param {string|ObjectId} conversationId - The conversation ID
 * @returns {Promise<Object>} - Deletion result
 */
async function deleteMessagesForConversation(conversationId) {
  try {
    // Validate conversation exists and is a study session
    const conversation = await Conversation.findOne({
      _id: conversationId,
      type: "STUDY_SESSION",
    });

    if (!conversation) {
      throw new Error("Conversation not found or not a study session");
    }

    // Delete all messages
    const result = await Message.deleteMessagesForConversation(conversationId);

    // Also mark the conversation as inactive
    await conversationService.deactivateStudySessionConversation(
      conversation.studySessionId
    );

    return result;
  } catch (error) {
    console.error("Error deleting messages for conversation:", error);
    throw error;
  }
}

/**
 * Create a system notification message in a conversation
 * @param {string|ObjectId} conversationId - The conversation ID
 * @param {string} text - The notification text
 * @returns {Promise<Object>} - The created message
 */
async function createSystemNotification(conversationId, text) {
  try {
    // Validate the conversation exists
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Create the content object
    const content = {
      type: "SYSTEM_NOTIFICATION",
      text,
    };

    // Use a null senderId or special system ID for system notifications
    // Here we're using null, but you might want to create a special system user
    const systemSenderId = null;

    // Create the message directly (don't use saveMessage as it checks for participant)
    const message = await Message.createMessage(
      conversationId,
      systemSenderId,
      content
    );

    // Update lastMessage in conversation
    await conversationService.updateConversationLastMessage(conversationId, {
      text,
      senderId: systemSenderId,
      timestamp: message.timestamp,
    });

    return message;
  } catch (error) {
    console.error("Error creating system notification:", error);
    throw error;
  }
}

module.exports = {
  saveMessage,
  getMessagesForConversation,
  deleteMessagesForConversation,
  createSystemNotification,
}; 