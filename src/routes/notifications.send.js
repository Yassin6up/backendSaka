const express = require('express');
const { Expo } = require('expo-server-sdk');
const { query } = require('../config/db');

const expo = new Expo();
const router = express.Router();

// Ported from legacy: POST /send-notification
router.post('/send-notification', async (req, res, next) => {
  try {
    const { title, body: message, redirectId, redirectType, userIds } = req.body;
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'Invalid user IDs' });
    }

    const users = await new Promise((resolve, reject) =>
      query('SELECT id, notificationToken FROM users WHERE id IN (?)', [userIds], (e, r) => (e ? reject(e) : resolve(r)))
    );

    const validTokens = users
      .filter((u) => u.notificationToken)
      .map((u) => ({
        to: u.notificationToken,
        sound: 'default',
        title,
        body: message,
        data: { redirectType, redirectId },
      }));

    if (validTokens.length > 0) {
      await expo.sendPushNotificationsAsync(validTokens);
    }

    const column = redirectType === 'post' ? 'placeId' : redirectType === 'user' ? 'profileId' : 'profileId';
    const values = userIds.map((id) => [id, title, message, redirectId || null]);
    await new Promise((resolve, reject) =>
      query(`INSERT INTO notifications (user_id, title, message, ${column}) VALUES ?`, [values], (e) => (e ? reject(e) : resolve()))
    );

    res.json({ success: true, sent: validTokens.length, total: userIds.length, message: 'Notifications processed successfully' });
  } catch (err) { next(err); }
});

module.exports = router;
