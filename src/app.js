require('dotenv').config();
const express = require('express');
const http = require('http');
const cron = require('node-cron');
const moment = require('moment');

// Import configurations
const config = require('./config/app');
const db = require('./config/database');

// Import middleware
const { cors, bodyParser } = require('./middleware');

// Import routes
const routes = require('./routes');

// Create Express app
const app = express();

// Middleware setup
app.use(cors);
app.use(bodyParser);

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Multer error handling
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 5MB.'
    });
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      message: 'Too many files. Maximum is 10 files.'
    });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Unexpected field name in file upload.'
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Cron job for cleanup (runs daily at midnight)
cron.schedule('0 0 * * *', () => {
  console.log('Running daily cleanup...');
  
  // Clean up expired phone verifications
  const cleanupQuery = 'DELETE FROM phone_verifications WHERE expires_at < NOW()';
  db.query(cleanupQuery, (err) => {
    if (err) {
      console.error('Cleanup error:', err);
    } else {
      console.log('Expired phone verifications cleaned up');
    }
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  db.end(() => {
    console.log('Database connection closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  db.end(() => {
    console.log('Database connection closed.');
    process.exit(0);
  });
});

// Start server
const server = http.createServer(app);

server.listen(config.port, () => {
  console.log(`🚀 Server started on port ${config.port}`);
  console.log(`📱 Environment: ${config.nodeEnv}`);
  console.log(`🕐 Started at: ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
});

module.exports = app;