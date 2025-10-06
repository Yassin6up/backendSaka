const { db } = require('../config/db');
const { sendPushNotifications } = require('../services/expoService');

async function sendNotification(req, res) {
  const { title, body: message, redirectId, redirectType, userIds } = req.body;
  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ error: 'Invalid user IDs' });
  }

  db.query('SELECT id, notificationToken FROM users WHERE id IN (?)', [userIds], async (userErr, users) => {
    if (userErr) return res.status(500).json({ error: 'Failed to fetch users' });

    try {
      const messages = users
        .filter((u) => u.notificationToken)
        .map((u) => ({
          to: u.notificationToken,
          sound: 'default',
          title,
          body: message,
          data: { redirectType, redirectId },
        }));

      const sent = await sendPushNotifications(messages);
      const column = redirectType === 'post' ? 'placeId' : redirectType === 'user' ? 'profileId' : 'profileId';
      const insertQuery = `INSERT INTO notifications (user_id, title, message, ${column}) VALUES ?`;
      const values = userIds.map((id) => [id, title, message, redirectId || null]);

      db.query(insertQuery, [values], (insertErr) => {
        if (insertErr) return res.status(500).json({ error: insertErr });
        res.json({ success: true, sent, total: userIds.length, message: 'Notifications processed successfully' });
      });
    } catch (e) {
      res.status(500).json({ error: 'Failed to send push notifications' });
    }
  });
}

function getUserNotifications(req, res) {
  const { userId } = req.params;
  const query = `
    SELECT n.*, u.name, u.phone, u.trustable, u.picture_url, u.image_name
    FROM notifications n
    JOIN users u ON n.from_id = u.id
    WHERE n.user_id = ?
  `;
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results.reverse());
  });
}

function markRead(req, res) {
  const { id } = req.params;
  db.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Notification marked as read' });
  });
}

function deleteNotification(req, res) {
  const { id } = req.params;
  if (!Number.isInteger(Number(id))) return res.status(400).json({ error: 'Invalid notification ID format' });
  db.query('DELETE FROM notifications WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Internal server error' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Notification not found' });
    res.json({ success: true, message: 'Notification deleted successfully', deletedId: id });
  });
}

function unreadCount(req, res) {
  const { userId } = req.params;
  const query = `SELECT COUNT(*) AS unreadCount FROM notifications WHERE user_id = ? AND is_read = 0`;
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch unread notifications' });
    res.json({ unreadCount: results[0].unreadCount });
  });
}

module.exports = { sendNotification, getUserNotifications, markRead, deleteNotification, unreadCount };
