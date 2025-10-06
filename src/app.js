require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
const moment = require('moment');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const placesRoutes = require('./routes/places');
const notificationsRoutes = require('./routes/notifications');
const bookingsRoutes = require('./routes/bookings');
const categoriesRoutes = require('./routes/categories');

// Create Express app
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'JBuy Backend Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Server status endpoint
app.get('/server/status', (req, res) => {
  res.json({
    success: true,
    status: 'running',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/categories', categoriesRoutes);

// Additional routes that were in the original index.js
app.get('/test/sms', async (req, res) => {
  try {
    const smsService = require('./services/smsService');
    const result = await smsService.sendVerificationCode('966501234567', 'Test SMS from JBuy');
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin routes
app.get('/api/admin/getData', (req, res) => {
  // This would typically require admin authentication
  res.json({
    success: true,
    message: 'Admin data endpoint - implement based on requirements'
  });
});

// Search routes
app.get('/search/users', async (req, res) => {
  try {
    const User = require('./models/User');
    const { q, limit = 20, offset = 0 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const users = await User.search(q, parseInt(limit), parseInt(offset));
    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.get('/search/places', async (req, res) => {
  try {
    const Place = require('./models/Place');
    const { q, limit = 20, offset = 0 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const places = await Place.findAll({ search: q }, parseInt(limit), parseInt(offset));
    res.json({
      success: true,
      places
    });
  } catch (error) {
    console.error('Search places error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Privacy and Terms endpoints
app.get('/privacy', (req, res) => {
  res.json({
    success: true,
    message: 'Privacy Policy - Implement based on requirements'
  });
});

app.get('/terms', (req, res) => {
  res.json({
    success: true,
    message: 'Terms of Service - Implement based on requirements'
  });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`🚀 JBuy Backend Server started on port ${port}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${process.env.DB_NAME || 'Not configured'}`);
  console.log(`📧 SMS Service: ${process.env.SMS_USER ? 'Configured' : 'Not configured'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

module.exports = app;