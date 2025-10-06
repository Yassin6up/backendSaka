const { Expo } = require('expo-server-sdk');
const db = require('../config/database');

class NotificationService {
  constructor() {
    this.expo = new Expo();
  }

  async sendPushNotification(expoPushToken, title, body, data = {}) {
    if (!Expo.isExpoPushToken(expoPushToken)) {
      console.error(`Push token ${expoPushToken} is not a valid Expo push token`);
      return { success: false, error: 'Invalid push token' };
    }

    const message = {
      to: expoPushToken,
      sound: 'default',
      title,
      body,
      data,
    };

    try {
      const chunks = this.expo.chunkPushNotifications([message]);
      const tickets = [];

      for (const chunk of chunks) {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      }

      return { success: true, tickets };
    } catch (error) {
      console.error('Error sending push notification:', error);
      return { success: false, error: error.message };
    }
  }

  async saveNotification(userId, title, message, type = 'general', data = {}) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO notifications (user_id, title, message, type, data, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;
      
      const dataJson = JSON.stringify(data);
      
      db.query(query, [userId, title, message, type, dataJson], (error, result) => {
        if (error) {
          console.error('Error saving notification:', error);
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  async getUserNotifications(userId, limit = 20, offset = 0) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM notifications 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `;
      
      db.query(query, [userId, limit, offset], (error, results) => {
        if (error) {
          console.error('Error fetching notifications:', error);
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  async markNotificationAsRead(notificationId) {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE notifications SET is_read = 1 WHERE id = ?';
      
      db.query(query, [notificationId], (error, result) => {
        if (error) {
          console.error('Error marking notification as read:', error);
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  async deleteNotification(notificationId) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM notifications WHERE id = ?';
      
      db.query(query, [notificationId], (error, result) => {
        if (error) {
          console.error('Error deleting notification:', error);
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  async getUnreadNotificationCount(userId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0';
      
      db.query(query, [userId], (error, results) => {
        if (error) {
          console.error('Error getting unread count:', error);
          reject(error);
        } else {
          resolve(results[0].count);
        }
      });
    });
  }
}

module.exports = new NotificationService();