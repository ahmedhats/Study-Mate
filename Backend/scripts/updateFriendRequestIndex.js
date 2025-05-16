const mongoose = require('mongoose');
require('dotenv').config();
require('../models/friendRequest.model');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/studymate';

async function updateFriendRequestIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the FriendRequest collection
    const FriendRequest = mongoose.model('FriendRequest');
    const collection = FriendRequest.collection;

    // Drop the existing index
    try {
      await collection.dropIndex('sender_1_receiver_1');
      console.log('Successfully dropped old index');
    } catch (error) {
      console.log('No existing index to drop or error dropping index:', error.message);
    }

    // Create the new index
    await collection.createIndex(
      { sender: 1, receiver: 1, status: 1 },
      { 
        unique: true,
        partialFilterExpression: { status: 'pending' },
        background: true
      }
    );
    console.log('Successfully created new index');

    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error updating index:', error);
    process.exit(1);
  }
}

updateFriendRequestIndex(); 