// /backend/config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined. Check your .env file.');
    }
    
    console.log('Connecting to MongoDB with URI:', mongoUri.substring(0, 25) + '...');
    const conn = await mongoose.connect(mongoUri);
    
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    // Don't throw error in production - let server continue running
    if (process.env.NODE_ENV === 'production') {
      return false;
    }
    throw error;
  }
};

// Handle MongoDB connection events
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

module.exports = connectDB;