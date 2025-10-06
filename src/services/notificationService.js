const { Expo } = require('expo-server-sdk');
const db = require('../config/database');

const expo = new Expo();

class NotificationService {
  static sendNotification({ title, message, redirectId, redirectType, userId, fromId }, callback) {
    // Validate input parameters
    if (!title || !message || !userId || !fromId || !redirectId || !redirectType) {
      return callback(new Error('Missing required parameters.'));
    }

    // Fetch user's notification token
    const fetchUserQuery = 'SELECT id, notificationToken FROM users WHERE id = ?';
    db.query(fetchUserQuery, [userId], (fetchErr, fetchResults) => {
      if (fetchErr) {
        console.error('Database error fetching user:', fetchErr);
        return callback(new Error('Failed to fetch user.'));
      }
      if (fetchResults.length === 0) {
        return callback(new Error('User not found.'));
      }

      const user = fetchResults[0];

      // Send push notification if token exists
      if (user.notificationToken) {
        const notification = {
          to: user.notificationToken,
          sound: 'default',
          title,
          body: message,
          data: { redirectType, redirectId }
        };
        expo.sendPushNotificationsAsync([notification])
          .then(() => {
            console.log('Notification sent successfully.');
          })
          .catch((expoErr) => {
            console.error('Expo error:', expoErr);
            return callback(new Error('Failed to send notification.'));
          });
      }

      // Determine the correct column for redirection
      const column = redirectType === 'post' ? 'placeId' :
                     redirectType === 'user' ? 'profileId' : 'profileId';

      // Insert notification into the database
      const insertQuery = `
        INSERT INTO notifications 
        (user_id, from_id, title, message, ${column})
        VALUES (?, ?, ?, ?, ?)
      `;
      db.query(insertQuery, [userId, fromId, title, message, redirectId || null], (insertErr, insertResults) => {
        if (insertErr) {
          console.error('Database error inserting notification:', insertErr);
          return callback(new Error('Failed to insert notification.'));
        }

        callback(null, {
          success: true,
          message: 'Notification sent and saved successfully.',
          notificationId: insertResults.insertId
        });
      });
    });
  }

  static logAdminAction({ adminToken, actionType, placeId, actionMessage }, callback) {
    // Validate input parameters
    if (!adminToken || !actionType || !placeId || !actionMessage) {
      return callback(new Error('جميع الحقول مطلوبة')); // All fields are required
    }

    // Fetch admin details using the adminToken
    const fetchAdminQuery = 'SELECT id, name FROM admins WHERE token = ?';
    db.query(fetchAdminQuery, [adminToken], (fetchErr, fetchResults) => {
      if (fetchErr) {
        console.error('Database error (fetch admin):', fetchErr);
        return callback(new Error('فشل في جلب بيانات المدير')); // Failed to fetch admin details
      }

      if (fetchResults.length === 0) {
        return callback(new Error('المدير غير موجود')); // Admin not found
      }

      const admin = fetchResults[0];
      const adminId = admin.id;
      const adminName = admin.name;

      // Insert the admin action into the history table
      const insertQuery = `
        INSERT INTO admin_actions_history 
        (admin_id, admin_name, action_type, place_id, action_message)
        VALUES (?, ?, ?, ?, ?)
      `;

      const values = [adminId, adminName, actionType, placeId, actionMessage];

      db.query(insertQuery, values, (insertErr, insertResults) => {
        if (insertErr) {
          console.error('Database error (insert action):', insertErr);
          return callback(new Error('فشل في تسجيل عمل المدير')); // Failed to log admin action
        }

        callback(null, {
          success: true,
          message: 'تم تسجيل عمل المدير بنجاح', // Admin action logged successfully
          actionId: insertResults.insertId
        });
      });
    });
  }
}

module.exports = NotificationService;