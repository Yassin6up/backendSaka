const { db } = require('../config/db');

function toggleBlocked(req, res) {
  const userId = req.params.id;
  db.query('SELECT blocked FROM users WHERE id = ?', [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const newBlocked = rows[0].blocked === 1 ? 0 : 1;
    db.query('UPDATE users SET blocked = ? WHERE id = ?', [newBlocked, userId], (updateErr) => {
      if (updateErr) return res.status(500).json({ error: 'Error updating user' });
      res.json({ blocked: newBlocked });
    });
  });
}

function toggleTrustable(req, res) {
  const userId = req.params.id;
  db.query('SELECT trustable FROM users WHERE id = ?', [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const newTrustable = rows[0].trustable === 1 ? 0 : 1;
    db.query('UPDATE users SET trustable = ? WHERE id = ?', [newTrustable, userId], (updateErr) => {
      if (updateErr) return res.status(500).json({ error: 'Error updating user' });
      res.json({ trustable: newTrustable });
    });
  });
}

function blockedStatus(req, res) {
  const { userId } = req.params;
  db.query('SELECT blocked FROM users WHERE session_token = ?', [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Internal Server Error' });
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ userId, blocked: rows[0].blocked });
  });
}

module.exports = { toggleBlocked, toggleTrustable, blockedStatus };
