const express = require('express');
const router = express.Router();
const NotificationsController = require('../controllers/notificationsController');
const { authenticateUser } = require('../middleware/auth');

// All notification routes require authentication
router.use(authenticateUser);

// Send notification
router.post('/send-notification', NotificationsController.sendNotification);

// Get user notifications
router.get('/api/notifications/:userId', NotificationsController.getUserNotifications);

// Mark notification as read
router.post('/api/notifications/read/:id', NotificationsController.markAsRead);

// Delete notification
router.delete('/api/notifications/:id', NotificationsController.deleteNotification);

// Get unread notification count
router.get('/api/notifications/unread/:userId', NotificationsController.getUnreadCount);

// Toggle blocked status
router.post('/toggle_blocked/:id', NotificationsController.toggleBlocked);

// Toggle trustable status
router.post('/toggle_trustable/:id', NotificationsController.toggleTrustable);

// Get blocked status
router.get('/user/blocked-status/:userId', NotificationsController.getBlockedStatus);

module.exports = router;