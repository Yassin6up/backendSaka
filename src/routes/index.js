const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const placeRoutes = require('./places');
const bookingRoutes = require('./bookings');
const adminRoutes = require('./admin');
const notificationRoutes = require('./notifications');
const fileRoutes = require('./files');

// Health check route
router.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Jbuy Backend API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

router.get('/server/status', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/places', placeRoutes);
router.use('/bookings', bookingRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/api', fileRoutes);

module.exports = router;