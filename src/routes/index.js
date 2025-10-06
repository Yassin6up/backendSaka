const express = require('express');

const authRoutes = require('./auth');
const userRoutes = require('./users');
const notificationRoutes = require('./notifications');
const notificationSendRoute = require('./notifications.send');
const placesRoutes = require('./places');
const bookingsRoutes = require('./bookings');
const adminRoutes = require('./admin');
const categoriesRoutes = require('./categories');
const servicesRoutes = require('./services');
const settingsRoutes = require('./settings');
const miscRoutes = require('./misc');

const router = express.Router();

// Preserve original paths from legacy index.js using absolute paths inside each router
router.use('/', authRoutes);
router.use('/', userRoutes);
router.use('/api/notifications', notificationRoutes);
router.use('/', notificationSendRoute);
router.use('/', placesRoutes);
router.use('/', bookingsRoutes);
router.use('/', adminRoutes);
router.use('/', categoriesRoutes);
router.use('/api', servicesRoutes);
router.use('/', settingsRoutes);
router.use('/', miscRoutes);

module.exports = router;
