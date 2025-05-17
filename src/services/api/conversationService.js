import { get, post, del } from "./index";

/**
 * Fetch all conversations for the current user
 * @param {Object} options - Query options (type, limit, skip)
 * @returns {Promise<Object>} - API response
 */
export const getUserConversations = async (options = {}) => {
  const queryParams = new URLSearchParams();
  
  if (options.type) queryParams.append("type", options.type);
  if (options.limit) queryParams.append("limit", options.limit);
  if (options.skip) queryParams.append("skip", options.skip);
  
  const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
  return get(`/conversations${query}`);
};

/**
 * Get messages for a specific conversation
 * @param {string} conversationId - The conversation ID
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} - API response
 */
export const getConversationMessages = async (conversationId, options = {}) => {
  const queryParams = new URLSearchParams();
  
  if (options.limit) queryParams.append("limit", options.limit);
  if (options.before) queryParams.append("before", options.before);
  if (options.after) queryParams.append("after", options.after);
  
  const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
  return get(`/conversations/${conversationId}/messages${query}`);
};

/**
 * Send a message to a conversation
 * @param {string} conversationId - The conversation ID
 * @param {string} text - The message text
 * @param {string} type - The message type (defaults to TEXT)
 * @returns {Promise<Object>} - API response
 */
export const sendMessage = async (conversationId, text, type = "TEXT") => {
  return post(`/conversations/${conversationId}/messages`, {
    content: {
      type,
      text,
    },
  });
};

/**
 * Get or create a DM conversation with another user
 * @param {string} userId - The other user's ID
 * @returns {Promise<Object>} - API response with normalized data structure
 */
export const getOrCreateDMConversation = async (userId) => {
  try {
    const response = await post(`/conversations/dm/${userId}`, {});
    return response;  // Return the raw response, don't try to normalize it
  } catch (error) {
    console.error("Error in getOrCreateDMConversation:", error);
    throw error;
  }
};

/**
 * Mark a conversation as read
 * @param {string} conversationId - The conversation ID
 * @returns {Promise<Object>} - API response
 */
export const markConversationAsRead = async (conversationId) => {
  return post(`/conversations/${conversationId}/read`);
};

/**
 * Create a study session conversation
 * @param {string} sessionId - The study session ID
 * @param {Array<string>} participantIds - Array of participant user IDs
 * @returns {Promise<Object>} - API response
 */
export const createStudySessionConversation = async (sessionId, participantIds) => {
  return post(`/conversations/study-session/${sessionId}`, {
    participantIds,
  });
};

/**
 * Deactivate a study session conversation
 * @param {string} sessionId - The study session ID
 * @returns {Promise<Object>} - API response
 */
export const deactivateStudySessionConversation = async (sessionId) => {
  return del(`/conversations/study-session/${sessionId}`);
};

/**
 * Get a specific conversation by ID
 * @param {string} conversationId - The conversation ID
 * @returns {Promise<Object>} - API response
 */
export const getConversationById = async (conversationId) => {
  return get(`/conversations/${conversationId}`);
}; 