// MedAuth AI - index.js - Express app entrypoint
require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false }));

// Serve the client application statically
app.use(express.static(path.join(__dirname, '../client')));

// Routes
app.use('/api/cases', require('./routes/cases'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/insurers', require('./routes/insurers'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/auditlogs', require('./routes/auditlogs'));

// Health Routes
const mongoose = require('mongoose');

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.get('/api/health/db', (req, res) => {
  const state = mongoose.connection.readyState;
  res.json({ status: state === 1 ? 'connected' : 'disconnected', readyState: state });
});

app.get('/api/health/ai', (req, res) => {
  const keySet = !!process.env.GEMINI_API_KEY;
  res.json({
    status: keySet ? 'ok' : 'missing_key',
    model: process.env.AI_MODEL || 'gemini-2.0-flash',
    provider: 'Google Gemini (free tier)',
    keyConfigured: keySet
  });
});

// Wildcard routing to handle frontend client mapping strictly AFTER all APIs
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../client/index.html'));
  } else {
    res.status(404).json({ success: false, message: 'API Route Not Found' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server Error' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend Client ready! Open this link: http://localhost:${PORT}`);
});
