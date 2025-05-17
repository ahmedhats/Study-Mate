import api from "./axiosConfig";

/**
 * Fetches all conversations for the current user
 * @returns {Promise} Promise object that resolves to the conversations data
 */
export const getConversations = async () => {
  try {
    const response = await api.get("/conversations");
    return response.data;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
};

/**
 * Fetches messages for a specific conversation
 * @param {string} conversationId - The ID of the conversation
 * @returns {Promise} Promise object that resolves to the messages data
 */
export const getMessages = async (conversationId) => {
  try {
    const response = await api.get(`/messages/conversations/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

/**
 * Sends a new message
 * @param {string} recipientId - The ID of the message recipient
 * @param {string} content - The message content
 * @returns {Promise} Promise object that resolves to the created message data
 */
export const sendMessage = async (recipientId, content) => {
  try {
    const response = await api.post("/messages/send", {
      recipientId,
      content,
    });
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

/**
 * Marks a conversation as read
 * @param {string} conversationId - The ID of the conversation
 * @returns {Promise} Promise object that resolves to the updated conversation
 */
export const markConversationAsRead = async (conversationId) => {
  try {
    const response = await api.put(
      `/conversations/${conversationId}/read`
    );
    return response.data;
  } catch (error) {
    console.error("Error marking conversation as read:", error);
    throw error;
  }
};

/**
 * Gets the count of unread messages
 * @returns {Promise} Promise object that resolves to the unread count
 */
export const getUnreadCount = async () => {
  try {
    const response = await api.get("/messages/unread/count");
    return response.data;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    throw error;
  }
};

/**
 * Creates a new conversation
 * @param {string} userId - The ID of the user to start a conversation with
 * @returns {Promise} Promise object that resolves to the created conversation
 */
export const createConversation = async (userId) => {
  try {
    const response = await api.post("/conversations/dm/" + userId);
    return response.data;
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
};

/**
 * Searches for users to message
 * @param {string} query - The search query
 * @returns {Promise} Promise object that resolves to the search results
 */
export const searchUsers = async (query) => {
  try {
    const response = await api.get(`/messages/users/search?query=${query}`);
    return response.data;
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
};
