const express = require('express');
const { query } = require('../config/db');

const router = express.Router();

// Admin getData using token from Authorization header (legacy /api/admin/getData)
router.get('/api/admin/getData', async (req, res, next) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const rows = await new Promise((resolve, reject) =>
      query('SELECT * FROM admins WHERE token = ?', [token], (e, r) => (e ? reject(e) : resolve(r)))
    );
    if (rows.length === 0) return res.status(403).json({ message: 'Invalid session' });
    res.json({ user: rows[0] });
  } catch (err) { next(err); }
});

// Example: admin login
router.post('/login', async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    const rows = await new Promise((resolve, reject) =>
      query('SELECT * FROM admins WHERE phone = ? AND password = ?', [phone, password], (e, r) => (e ? reject(e) : resolve(r)))
    );
    if (rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// Example: admin actions history by place
router.get('/actions/:placeId', async (req, res, next) => {
  try {
    const placeId = req.params.placeId;
    const rows = await new Promise((resolve, reject) =>
      query(
        `SELECT id, admin_id, admin_name, action_type, action_message, action_time 
         FROM admin_actions_history WHERE place_id = ? ORDER BY action_time DESC`,
        [placeId],
        (e, r) => (e ? reject(e) : resolve(r))
      )
    );
    res.json({ success: true, actions: rows });
  } catch (err) { next(err); }
});

module.exports = router;
