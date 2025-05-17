/**
 * Socket.IO handler for real-time messaging
 */
const User = require('./models/user.model');
const Conversation = require('./models/conversation.model');
const Message = require('./models/message.model');

const activeUsers = new Map(); // userId -> socketId
const socketUser = new Map(); // socketId -> userId

const initializeSocketHandler = (io) => {
  io.on('connection', async (socket) => {
    try {
      console.log(`Socket.IO: User connected: ${socket.userId}`);
      
      // Add user to active users
      activeUsers.set(socket.userId, socket.id);
      socketUser.set(socket.id, socket.userId);
      
      // Update user's lastActive status
      if (socket.userId) {
        try {
          await User.findByIdAndUpdate(socket.userId, {
            'statistics.lastActive': new Date()
          });
        } catch (err) {
          console.error('Error updating last active status:', err);
        }
      }
      
      // Broadcast user online status
      io.emit('SERVER:USER_STATUS', {
        userId: socket.userId,
        status: 'online'
      });
      
      // Join user's conversations
      try {
        const userConversations = await Conversation.find({
          'participants.userId': socket.userId
        }).select('_id');
        
        userConversations.forEach(conv => {
          socket.join(conv._id.toString());
          console.log(`${socket.userId} joined room ${conv._id.toString()}`);
        });
      } catch (err) {
        console.error('Error joining user conversations:', err);
      }
      
      // Handle socket events
      
      // Join a specific room/conversation
      socket.on('CLIENT:JOIN_ROOM', async (data) => {
        if (data.conversationId) {
          socket.join(data.conversationId);
          console.log(`${socket.userId} joined room ${data.conversationId}`);
        }
      });
      
      // Leave a room/conversation
      socket.on('CLIENT:LEAVE_ROOM', (data) => {
        if (data.conversationId) {
          socket.leave(data.conversationId);
          console.log(`${socket.userId} left room ${data.conversationId}`);
        }
      });
      
      // Handle incoming messages
      socket.on('CLIENT:SEND_MESSAGE', async (data) => {
        try {
          const { conversationId, content } = data;
          
          // Verify user is in the conversation
          const conversation = await Conversation.findOne({
            _id: conversationId,
            'participants.userId': socket.userId
          });
          
          if (!conversation) {
            console.error(`User ${socket.userId} not authorized for conversation ${conversationId}`);
            return;
          }
          
          // Get user data for the message
          const user = await User.findById(socket.userId);
          
          // Create message in database
          const message = new Message({
            conversationId,
            senderId: socket.userId,
            senderName: user.name,
            senderAvatar: user.avatar || null,
            content
          });
          
          await message.save();
          
          // Update conversation's last message
          conversation.lastMessage = {
            text: content.text,
            senderId: socket.userId,
            senderName: user.name,
            timestamp: new Date()
          };
          
          await conversation.save();
          
          // Broadcast message to conversation room
          io.to(conversationId).emit('SERVER:NEW_MESSAGE', {
            conversationId,
            message: {
              _id: message._id,
              senderId: message.senderId,
              senderName: message.senderName,
              senderAvatar: message.senderAvatar,
              content: message.content,
              timestamp: message.createdAt
            }
          });
        } catch (error) {
          console.error('Error processing message:', error);
        }
      });
      
      // Handle typing indicators
      socket.on('CLIENT:TYPING_START', (data) => {
        socket.to(data.conversationId).emit('SERVER:TYPING_START', {
          conversationId: data.conversationId,
          user: {
            id: socket.userId,
            name: socket.username || 'User'
          }
        });
      });
      
      socket.on('CLIENT:TYPING_STOP', (data) => {
        socket.to(data.conversationId).emit('SERVER:TYPING_STOP', {
          conversationId: data.conversationId,
          userId: socket.userId
        });
      });
      
      // Handle read receipts
      socket.on('CLIENT:MESSAGE_READ', async (data) => {
        try {
          const { conversationId } = data;
          
          // Update last read timestamp
          await Conversation.updateOne(
            { _id: conversationId, 'participants.userId': socket.userId },
            { $set: { 'participants.$.lastReadTimestamp': new Date() } }
          );
          
          // Broadcast read receipt
          socket.to(conversationId).emit('SERVER:MESSAGE_READ', {
            conversationId,
            userId: socket.userId,
            timestamp: new Date()
          });
        } catch (error) {
          console.error('Error processing read receipt:', error);
        }
      });
      
      // Handle disconnection
      socket.on('disconnect', async () => {
        try {
          console.log(`User disconnected: ${socket.userId}`);
          
          // Remove from active users
          activeUsers.delete(socket.userId);
          socketUser.delete(socket.id);
          
          // Update user's lastActive timestamp
          await User.findByIdAndUpdate(socket.userId, {
            'statistics.lastActive': new Date()
          });
          
          // Broadcast offline status
          io.emit('SERVER:USER_STATUS', {
            userId: socket.userId,
            status: 'offline'
          });
        } catch (error) {
          console.error('Error handling disconnect:', error);
        }
      });
    } catch (error) {
      console.error('Error in socket connection handler:', error);
    }
  });

  io.on('connect_error', (err) => {
    console.error('Socket.IO connection error:', err);
  });
  
  console.log('Socket.IO handler initialized');
};

module.exports = initializeSocketHandler; 