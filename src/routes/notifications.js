const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Notification routes
router.get('/:userId', notificationController.getUserNotifications);
router.get('/unread/:userId', notificationController.getUnreadNotificationsCount);

router.post('/send-notification', notificationController.sendBulkNotification);
router.post('/read/:id', notificationController.markNotificationAsRead);

router.delete('/:id', notificationController.deleteNotification);

module.exports = router;