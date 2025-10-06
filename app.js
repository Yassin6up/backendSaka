require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

// Import middleware
const corsMiddleware = require('./src/middleware/cors');
const { urlencoded, json } = require('./src/middleware/bodyParser');

// Import routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const placesRoutes = require('./src/routes/places');
const bookingRoutes = require('./src/routes/bookings');
const adminRoutes = require('./src/routes/admin');
const notificationRoutes = require('./src/routes/notifications');
const imageRoutes = require('./src/routes/images');

// Import utilities
const { initializeCronJobs } = require('./src/utils/cronJobs');
const { PORT } = require('./src/config/constants');

// Initialize Express app
const app = express();

// Middleware setup
app.use(corsMiddleware);
app.use(urlencoded);
app.use(json);

// Ensure upload directories exist
const uploadDirs = [
  'uploads/temp',
  'uploads/profiles', 
  'uploads/places',
  'uploads/slides',
  'uploads/icons'
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Server is running successfully!',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.get('/server/status', (req, res) => {
  res.json({ status: 'Server is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/images', imageRoutes);

// Legacy route mappings for backward compatibility
app.use('/', authRoutes);
app.use('/user', userRoutes);
app.use('/', placesRoutes);
app.use('/', bookingRoutes);
app.use('/admin', adminRoutes);
app.use('/', notificationRoutes);
app.use('/images', imageRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'خطأ في الخادم الداخلي',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'الصفحة غير موجودة'
  });
});

// Initialize cron jobs
initializeCronJobs();

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server started successfully on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;