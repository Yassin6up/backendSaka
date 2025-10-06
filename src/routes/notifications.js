const express = require('express');
const { query } = require('../config/db');
const { Expo } = require('expo-server-sdk');

const expo = new Expo();
const router = express.Router();

router.get('/:userId', async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const rows = await new Promise((resolve, reject) =>
      query(
        `SELECT n.*, u.name, u.phone, u.trustable, u.picture_url , u.image_name
         FROM notifications n
         JOIN users u ON n.from_id = u.id
         WHERE n.user_id = ?`,
        [userId],
        (e, r) => (e ? reject(e) : resolve(r))
      )
    );
    res.json(rows.reverse());
  } catch (err) { next(err); }
});

router.post('/read/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    await new Promise((resolve, reject) =>
      query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [id], (e) => (e ? reject(e) : resolve()))
    );
    res.json({ message: 'Notification marked as read' });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!Number.isInteger(Number(id))) {
      return res.status(400).json({ error: 'Invalid notification ID format' });
    }
    await new Promise((resolve, reject) =>
      query('DELETE FROM notifications WHERE id = ?', [id], (e) => (e ? reject(e) : resolve()))
    );
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.get('/unread/count/:userId', async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const [row] = await new Promise((resolve, reject) =>
      query(
        `SELECT COUNT(*) AS unreadCount FROM notifications WHERE user_id = ? AND is_read = 0`,
        [userId],
        (e, r) => (e ? reject(e) : resolve(r))
      )
    );
    res.json({ unreadCount: row ? row.unreadCount : 0 });
  } catch (err) { next(err); }
});

router.post('/broadcast', async (req, res, next) => {
  try {
    const { title, body: message, redirectId, redirectType, userIds } = req.body;
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'Invalid user IDs' });
    }

    const users = await new Promise((resolve, reject) =>
      query('SELECT id, notificationToken FROM users WHERE id IN (?)', [userIds], (e, r) => (e ? reject(e) : resolve(r)))
    );

    const tickets = users
      .filter((u) => u.notificationToken)
      .map((u) => ({
        to: u.notificationToken,
        sound: 'default',
        title,
        body: message,
        data: { redirectType, redirectId },
      }));

    if (tickets.length > 0) {
      await expo.sendPushNotificationsAsync(tickets);
    }

    const column = redirectType === 'post' ? 'placeId' : redirectType === 'user' ? 'profileId' : 'profileId';
    const values = userIds.map((id) => [id, title, message, redirectId || null]);
    await new Promise((resolve, reject) =>
      query(
        `INSERT INTO notifications (user_id, title, message, ${column}) VALUES ?`,
        [values],
        (e) => (e ? reject(e) : resolve())
      )
    );

    res.json({ success: true, sent: tickets.length, total: userIds.length, message: 'Notifications processed successfully' });
  } catch (err) { next(err); }
});

module.exports = router;
