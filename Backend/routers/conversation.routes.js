const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversation.controller');
const { auth } = require('../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(auth);

// Conversation routes
router.get('/', conversationController.getUserConversations);
router.get('/:id', conversationController.getConversationById);
router.post('/dm/:targetUserId', conversationController.getOrCreateDMConversation);
router.put('/:id/read', conversationController.markConversationAsRead);

module.exports = router; 