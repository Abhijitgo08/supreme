// MedAuth AI — config/db.js — MongoDB Atlas connection

const mongoose = require('mongoose');

let MONGODB_URI = process.env.MONGODB_URI || '';
const ATLAS_URI = 'mongodb+srv://db_user:zSJGYWnb15TKsLqo@cluster0.gaxkzvv.mongodb.net/medauth?retryWrites=true&w=majority&appName=Cluster0';

if (!MONGODB_URI || MONGODB_URI.includes('127.0.0.1') || MONGODB_URI.includes('localhost')) {
  MONGODB_URI = ATLAS_URI;
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
    console.log('MongoDB Atlas connected:', conn.connection.host);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => 
  console.warn('MongoDB disconnected'));
mongoose.connection.on('reconnected', () => 
  console.log('MongoDB reconnected'));

module.exports = connectDB;
