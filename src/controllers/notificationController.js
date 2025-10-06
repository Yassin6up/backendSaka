const { ResponseHelper } = require('../utils');
const { NotificationService } = require('../services');
const db = require('../config/database');

class NotificationController {
  static async sendNotification(req, res) {
    try {
      const { title, message, redirectId, redirectType, userId, fromId } = req.body;

      if (!title || !message || !userId || !fromId || !redirectId || !redirectType) {
        return ResponseHelper.validationError(res, 'All fields are required');
      }

      NotificationService.sendNotification({
        title,
        message,
        redirectId,
        redirectType,
        userId,
        fromId
      }, (err, result) => {
        if (err) {
          console.error('Send notification error:', err);
          return ResponseHelper.error(res, err.message, 500);
        }

        return ResponseHelper.success(res, result, 'Notification sent successfully');
      });

    } catch (error) {
      console.error('Send notification error:', error);
      return ResponseHelper.error(res, 'Failed to send notification', 500, error);
    }
  }

  static async getUserNotifications(req, res) {
    try {
      const { userId } = req.params;

      const query = `
        SELECT n.*, u.name as from_name
        FROM notifications n
        LEFT JOIN users u ON n.from_id = u.id
        WHERE n.user_id = ?
        ORDER BY n.created_at DESC
      `;

      db.query(query, [userId], (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return ResponseHelper.error(res, 'Database error', 500);
        }

        return ResponseHelper.success(res, results, 'Notifications retrieved successfully');
      });

    } catch (error) {
      console.error('Get user notifications error:', error);
      return ResponseHelper.error(res, 'Failed to retrieve notifications', 500, error);
    }
  }

  static async markNotificationAsRead(req, res) {
    try {
      const { id } = req.params;

      const query = 'UPDATE notifications SET is_read = 1 WHERE id = ?';
      db.query(query, [id], (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return ResponseHelper.error(res, 'Database error', 500);
        }

        if (result.affectedRows === 0) {
          return ResponseHelper.notFound(res, 'Notification not found');
        }

        return ResponseHelper.success(res, null, 'Notification marked as read');
      });

    } catch (error) {
      console.error('Mark notification as read error:', error);
      return ResponseHelper.error(res, 'Failed to mark notification as read', 500, error);
    }
  }

  static async deleteNotification(req, res) {
    try {
      const { id } = req.params;

      const query = 'DELETE FROM notifications WHERE id = ?';
      db.query(query, [id], (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return ResponseHelper.error(res, 'Database error', 500);
        }

        if (result.affectedRows === 0) {
          return ResponseHelper.notFound(res, 'Notification not found');
        }

        return ResponseHelper.success(res, null, 'Notification deleted successfully');
      });

    } catch (error) {
      console.error('Delete notification error:', error);
      return ResponseHelper.error(res, 'Failed to delete notification', 500, error);
    }
  }

  static async getUnreadNotifications(req, res) {
    try {
      const { userId } = req.params;

      const query = `
        SELECT COUNT(*) as count
        FROM notifications
        WHERE user_id = ? AND is_read = 0
      `;

      db.query(query, [userId], (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return ResponseHelper.error(res, 'Database error', 500);
        }

        return ResponseHelper.success(res, { count: results[0].count }, 'Unread notifications count retrieved');
      });

    } catch (error) {
      console.error('Get unread notifications error:', error);
      return ResponseHelper.error(res, 'Failed to retrieve unread notifications count', 500, error);
    }
  }

  static async toggleBlocked(req, res) {
    try {
      const { id } = req.params;
      const { isBlocked } = req.body;

      const query = 'UPDATE users SET is_blocked = ? WHERE id = ?';
      db.query(query, [isBlocked ? 1 : 0, id], (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return ResponseHelper.error(res, 'Database error', 500);
        }

        if (result.affectedRows === 0) {
          return ResponseHelper.notFound(res, 'User not found');
        }

        return ResponseHelper.success(res, null, `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`);
      });

    } catch (error) {
      console.error('Toggle blocked error:', error);
      return ResponseHelper.error(res, 'Failed to update user status', 500, error);
    }
  }

  static async toggleTrustable(req, res) {
    try {
      const { id } = req.params;
      const { isTrustable } = req.body;

      const query = 'UPDATE users SET is_trustable = ? WHERE id = ?';
      db.query(query, [isTrustable ? 1 : 0, id], (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return ResponseHelper.error(res, 'Database error', 500);
        }

        if (result.affectedRows === 0) {
          return ResponseHelper.notFound(res, 'User not found');
        }

        return ResponseHelper.success(res, null, `User ${isTrustable ? 'marked as trustable' : 'marked as not trustable'} successfully`);
      });

    } catch (error) {
      console.error('Toggle trustable error:', error);
      return ResponseHelper.error(res, 'Failed to update user status', 500, error);
    }
  }

  static async getBlockedStatus(req, res) {
    try {
      const { userId } = req.params;

      const query = 'SELECT is_blocked, is_trustable FROM users WHERE id = ?';
      db.query(query, [userId], (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return ResponseHelper.error(res, 'Database error', 500);
        }

        if (results.length === 0) {
          return ResponseHelper.notFound(res, 'User not found');
        }

        return ResponseHelper.success(res, {
          isBlocked: results[0].is_blocked === 1,
          isTrustable: results[0].is_trustable === 1
        }, 'User status retrieved successfully');
      });

    } catch (error) {
      console.error('Get blocked status error:', error);
      return ResponseHelper.error(res, 'Failed to retrieve user status', 500, error);
    }
  }
}

module.exports = NotificationController;