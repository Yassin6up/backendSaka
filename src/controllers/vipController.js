const moment = require('moment');
const { db } = require('../config/db');

function makeVip(req, res) {
  const { placeId, duration, adminToken } = req.body;
  if (!placeId || !duration) return res.status(400).json({ error: 'Place ID and duration are required.' });

  let vipExpiresAt; let arabicTime;
  switch (duration) {
    case '24h': vipExpiresAt = moment().add(24, 'hours').format('YYYY-MM-DD HH:mm:ss'); arabicTime = '24 ساعة'; break;
    case '1week': vipExpiresAt = moment().add(7, 'days').format('YYYY-MM-DD HH:mm:ss'); arabicTime = 'اسبوع'; break;
    case '15days': vipExpiresAt = moment().add(15, 'days').format('YYYY-MM-DD HH:mm:ss'); arabicTime = '15 يوما'; break;
    case '30days': vipExpiresAt = moment().add(30, 'days').format('YYYY-MM-DD HH:mm:ss'); arabicTime = '30 يوم'; break;
    default: return res.status(400).json({ error: 'Invalid subscription duration.' });
  }

  const fetchOwnerQuery = 'SELECT owner_id FROM places WHERE id = ?';
  db.query(fetchOwnerQuery, [placeId], (fetchErr, fetchResults) => {
    if (fetchErr) return res.status(500).json({ error: 'Failed to fetch place owner.' });
    if (fetchResults.length === 0) return res.status(404).json({ error: 'Place not found.' });

    const updateQuery = `UPDATE places SET sponsored = 1, vipExpiresAt = ? WHERE id = ?`;
    db.query(updateQuery, [vipExpiresAt, placeId], (updateErr) => {
      if (updateErr) return res.status(500).json({ error: 'Failed to update place.' });

      const fetchAdminQuery = 'SELECT id, name FROM admins WHERE token = ?';
      db.query(fetchAdminQuery, [adminToken], (adminErr, adminResults) => {
        if (adminErr || adminResults.length === 0) return res.status(404).json({ error: 'Admin not found.' });
        const { id: adminId, name: adminName } = adminResults[0];
        const insertActionQuery = `INSERT INTO admin_actions_history (admin_id, admin_name, action_type, place_id, action_message) VALUES (?, ?, ?, ?, ?)`;
        const actionMessage = `تم وضع الاعلان ضمن الفي اي بي لمدة ${arabicTime}`;
        db.query(insertActionQuery, [adminId, adminName, 'vip', placeId, actionMessage], (insertErr) => {
          if (insertErr) return res.status(500).json({ error: 'Failed to log admin action.' });
          res.json({ success: true, message: 'Subscription updated and history logged.' });
        });
      });
    });
  });
}

module.exports = { makeVip };
