const { Expo } = require('expo-server-sdk');
const db = require('../config/database');

const expo = new Expo();

const sendNotification = ({ title, message, redirectId, redirectType, userId, fromId }, callback) => {
  const fetchUserQuery = `
    SELECT expo_push_token 
    FROM users 
    WHERE id = ? AND expo_push_token IS NOT NULL AND expo_push_token != ''
  `;
  
  db.query(fetchUserQuery, [userId], (fetchErr, fetchResults) => {
    if (fetchErr) {
      console.error('Error fetching user:', fetchErr);
      return callback(fetchErr, null);
    }

    if (fetchResults.length > 0) {
      const expoPushToken = fetchResults[0].expo_push_token;
      
      if (Expo.isExpoPushToken(expoPushToken)) {
        expo.sendPushNotificationsAsync([{
          to: expoPushToken,
          sound: 'default',
          title: title,
          body: message,
          data: { redirectId, redirectType },
        }])
        .then(() => {
          console.log('Push notification sent successfully');
        })
        .catch((expoErr) => {
          console.error('Error sending push notification:', expoErr);
        });
      }
    }

    const insertQuery = `
      INSERT INTO notifications (user_id, from_id, title, message, redirect_id) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    db.query(insertQuery, [userId, fromId, title, message, redirectId || null], (insertErr, insertResults) => {
      if (insertErr) {
        console.error('Error inserting notification:', insertErr);
        return callback(insertErr, null);
      }
      
      callback(null, insertResults);
    });
  });
};

const logAdminAction = ({ adminToken, actionType, placeId, actionMessage }, callback) => {
  const fetchAdminQuery = `
    SELECT id, name 
    FROM admins 
    WHERE token = ?
  `;
  
  db.query(fetchAdminQuery, [adminToken], (fetchErr, fetchResults) => {
    if (fetchErr) {
      console.error('Error fetching admin:', fetchErr);
      return callback(fetchErr, null);
    }

    if (fetchResults.length === 0) {
      return callback(new Error('Admin not found'), null);
    }

    const admin = fetchResults[0];
    const insertQuery = `
      INSERT INTO admin_actions (admin_id, admin_name, action_type, place_id, action_message, created_at) 
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    
    const values = [admin.id, admin.name, actionType, placeId, actionMessage];
    
    db.query(insertQuery, values, (insertErr, insertResults) => {
      if (insertErr) {
        console.error('Error logging admin action:', insertErr);
        return callback(insertErr, null);
      }
      
      callback(null, insertResults);
    });
  });
};

module.exports = {
  sendNotification,
  logAdminAction
};