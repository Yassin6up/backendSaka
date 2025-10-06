const { Expo } = require('expo-server-sdk');
const { query } = require('../config/db');

const expo = new Expo();

async function sendNotification({ title, message, redirectId, redirectType, userId, fromId }) {
  if (!title || !message || !userId || !fromId || !redirectId || !redirectType) {
    throw new Error('Missing required parameters.');
  }

  const fetchUserQuery = 'SELECT id, notificationToken FROM users WHERE id = ?';
  const [user] = await new Promise((resolve, reject) => {
    query(fetchUserQuery, [userId], (err, results) => {
      if (err) return reject(err);
      if (results.length === 0) return reject(new Error('User not found.'));
      resolve(results);
    });
  });

  if (user.notificationToken) {
    const notification = {
      to: user.notificationToken,
      sound: 'default',
      title,
      body: message,
      data: { redirectType, redirectId },
    };
    await expo.sendPushNotificationsAsync([notification]);
  }

  const column = redirectType === 'post' ? 'placeId' : redirectType === 'user' ? 'profileId' : 'profileId';
  const insertQuery = `INSERT INTO notifications (user_id, from_id, title, message, ${column}) VALUES (?, ?, ?, ?, ?)`;
  await new Promise((resolve, reject) => {
    query(insertQuery, [userId, fromId, title, message, redirectId || null], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  return { success: true };
}

module.exports = { sendNotification };
