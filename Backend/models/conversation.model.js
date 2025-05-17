const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Schema for conversation participants with last read timestamp
 */
const participantSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  lastReadTimestamp: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Conversation schema for different types of chats
 */
const conversationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["DM", "COMMUNITY", "STUDY_SESSION"],
      required: true,
    },
    participants: [participantSchema],
    communityId: {
      type: Schema.Types.ObjectId,
      ref: "Community",
      required: function () {
        return this.type === "COMMUNITY";
      },
    },
    studySessionId: {
      type: Schema.Types.ObjectId,
      ref: "StudySession",
      required: function () {
        return this.type === "STUDY_SESSION";
      },
    },
    lastMessage: {
      type: Schema.Types.Mixed,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Indexes for faster queries
conversationSchema.index({ "participants.userId": 1 });
conversationSchema.index({ type: 1 });
conversationSchema.index({ communityId: 1 }, { sparse: true });
conversationSchema.index({ studySessionId: 1 }, { sparse: true });
conversationSchema.index({ updatedAt: -1 }); // For sorting by most recent activity

/**
 * Get or create a direct message conversation between two users
 * @param {ObjectId|string} userId1 - First user's ID
 * @param {ObjectId|string} userId2 - Second user's ID
 * @returns {Promise<Object>} - The conversation object
 */
conversationSchema.statics.getOrCreateDMConversation = async function(userId1, userId2) {
  // Sort user IDs to ensure consistent query pattern regardless of order
  const userIds = [userId1, userId2].map(id => 
    typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id
  ).sort((a, b) => a.toString().localeCompare(b.toString()));

  // Try to find an existing DM conversation between these users
  let conversation = await this.findOne({
    type: "DM",
    "participants.userId": { $all: userIds },
    // Make sure it only has these two participants (no more/less)
    $expr: { $eq: [{ $size: "$participants" }, 2] }
  });

  // If no conversation exists, create a new one
  if (!conversation) {
    conversation = await this.create({
      type: "DM",
      participants: [
        {
          userId: userIds[0],
          lastReadTimestamp: new Date()
        },
        {
          userId: userIds[1],
          lastReadTimestamp: new Date()
        }
      ],
      isActive: true
    });
  }

  return conversation;
};

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation; 