const express = require('express');
const { sendNotification, getUserNotifications, markRead, deleteNotification, unreadCount } = require('../controllers/notificationController');
const router = express.Router();

router.post('/send-notification', sendNotification);
router.get('/api/notifications/:userId', getUserNotifications);
router.post('/api/notifications/read/:id', markRead);
router.delete('/api/notifications/:id', deleteNotification);
router.get('/api/notifications/unread/:userId', unreadCount);

module.exports = router;
