const express = require('express');
const router = express.Router();
const { NotificationController } = require('../controllers');
const { auth } = require('../middleware');

// Protected routes
router.post('/send', auth.verifyUserToken, NotificationController.sendNotification);
router.get('/user/:userId', auth.verifyUserToken, NotificationController.getUserNotifications);
router.put('/:id/read', auth.verifyUserToken, NotificationController.markNotificationAsRead);
router.delete('/:id', auth.verifyUserToken, NotificationController.deleteNotification);
router.get('/unread/:userId', auth.verifyUserToken, NotificationController.getUnreadNotifications);
router.post('/toggle-blocked/:id', auth.verifyUserToken, NotificationController.toggleBlocked);
router.post('/toggle-trustable/:id', auth.verifyUserToken, NotificationController.toggleTrustable);
router.get('/blocked-status/:userId', auth.verifyUserToken, NotificationController.getBlockedStatus);

module.exports = router;