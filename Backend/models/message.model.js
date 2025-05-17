const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Message schema for all types of messages
 */
const messageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    senderAvatar: {
      type: String,
      default: null,
    },
    content: {
      type: {
        type: String,
        enum: ["TEXT", "SYSTEM_NOTIFICATION"],
        default: "TEXT",
      },
      text: {
        type: String,
        required: true,
      },
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Creates createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Create indexes for efficient querying
messageSchema.index({ conversationId: 1, createdAt: -1 }); // For retrieving messages by conversation
messageSchema.index({ senderId: 1 }); // For fetching user messages

/**
 * Create a new message
 * @param {string|ObjectId} conversationId - The conversation ID
 * @param {string|ObjectId} senderId - The sender's user ID
 * @param {Object} content - Message content
 * @returns {Promise<Object>} - The created message
 */
messageSchema.statics.createMessage = async function(conversationId, senderId, content) {
  return this.create({
    conversationId,
    senderId,
    content,
    timestamp: new Date()
  });
};

/**
 * Get messages for a conversation with pagination
 * @param {string|ObjectId} conversationId - The conversation ID
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>} - Array of message objects
 */
messageSchema.statics.getMessagesForConversation = async function(conversationId, options = {}) {
  const { limit = 50, before, after } = options;
  
  let query = { 
    conversationId,
    isDeleted: false
  };
  
  // Add timestamp filtering if provided
  if (before) {
    query.timestamp = { ...query.timestamp, $lt: new Date(before) };
  }
  
  if (after) {
    query.timestamp = { ...query.timestamp, $gt: new Date(after) };
  }
  
  return this.find(query)
    .sort({ timestamp: -1 }) // Most recent first
    .limit(parseInt(limit))
    .populate('senderId', 'name username') // Get sender info
    .exec();
};

/**
 * Delete all messages for a conversation
 * @param {string|ObjectId} conversationId - The conversation ID
 * @returns {Promise<Object>} - Deletion result
 */
messageSchema.statics.deleteMessagesForConversation = async function(conversationId) {
  return this.deleteMany({ conversationId });
};

const Message = mongoose.model("Message", messageSchema);

module.exports = Message; 