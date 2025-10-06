const notificationService = require('../services/notificationService');
const { asyncHandler } = require('../middleware/errorHandler');

class NotificationsController {
  // Send notification
  static sendNotification = asyncHandler(async (req, res) => {
    const { userId, title, message, type = 'general', data = {} } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'User ID, title, and message are required'
      });
    }

    await notificationService.saveNotification(userId, title, message, type, data);

    res.json({
      success: true,
      message: 'Notification sent successfully'
    });
  });

  // Get user notifications
  static getUserNotifications = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;
    const notifications = await notificationService.getUserNotifications(userId, limit, offset);

    res.json({
      success: true,
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: notifications.length
      }
    });
  });

  // Mark notification as read
  static markAsRead = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await notificationService.markNotificationAsRead(id);

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  });

  // Delete notification
  static deleteNotification = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await notificationService.deleteNotification(id);

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  });

  // Get unread notification count
  static getUnreadCount = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const count = await notificationService.getUnreadNotificationCount(userId);

    res.json({
      success: true,
      unreadCount: count
    });
  });

  // Toggle blocked status
  static toggleBlocked = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isBlocked } = req.body;

    // This would typically update a user's blocked status in the database
    // Implementation depends on your database schema
    res.json({
      success: true,
      message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`
    });
  });

  // Toggle trustable status
  static toggleTrustable = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isTrustable } = req.body;

    // This would typically update a user's trustable status in the database
    // Implementation depends on your database schema
    res.json({
      success: true,
      message: `User marked as ${isTrustable ? 'trustable' : 'not trustable'}`
    });
  });

  // Get blocked status
  static getBlockedStatus = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // This would typically check a user's blocked status in the database
    // Implementation depends on your database schema
    res.json({
      success: true,
      isBlocked: false // Placeholder
    });
  });
}

module.exports = NotificationsController;