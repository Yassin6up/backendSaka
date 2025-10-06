const express = require('express');
const { query } = require('../config/db');

const router = express.Router();

router.post('/update-settings', async (req, res, next) => {
  try {
    const { whatsappLink, phoneNumber, commissionValue, limitPosts, appVersion } = req.body;

    const [{ count }] = await new Promise((resolve, reject) =>
      query('SELECT COUNT(*) AS count FROM settings', [], (e, r) => (e ? reject(e) : resolve(r)))
    );

    const sql = count > 0
      ? `UPDATE settings SET whatsapp_link = ?, phone_number = ?, commission_value = ?, app_version = ? WHERE id = 1`
      : `INSERT INTO settings (whatsapp_link, phone_number, commission_value, app_version) VALUES (?, ?, ?, ?)`;

    await new Promise((resolve, reject) => query(sql, [whatsappLink, phoneNumber, commissionValue, appVersion], (e) => (e ? reject(e) : resolve())));

    await new Promise((resolve, reject) =>
      query(`ALTER TABLE users MODIFY COLUMN limitPosts INT DEFAULT ?`, [limitPosts], (e) => (e ? reject(e) : resolve()))
    );

    res.status(200).json({ message: 'Settings and limitPosts default value updated successfully.' });
  } catch (err) { next(err); }
});

router.get('/get-settings', async (req, res, next) => {
  try {
    const settingsQuery = `SELECT whatsapp_link, phone_number, commission_value, app_version FROM settings`;
    const defaultLimitQuery = `SELECT COLUMN_DEFAULT AS defaultLimitPosts FROM information_schema.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'limitPosts'`;

    const [settings, [defaultLimit]] = await Promise.all([
      new Promise((resolve, reject) => query(settingsQuery, [], (e, r) => (e ? reject(e) : resolve(r)))),
      new Promise((resolve, reject) => query(defaultLimitQuery, [], (e, r) => (e ? reject(e) : resolve(r)))),
    ]);

    res.json({ settings: settings[0] || null, defaultLimitPosts: defaultLimit?.defaultLimitPosts || null });
  } catch (err) { next(err); }
});

router.get('/get-settings-admin', async (req, res, next) => {
  try {
    const settingsQuery = `SELECT whatsapp_link, phone_number, commission_value, app_version FROM settings`;
    const [settings] = await new Promise((resolve, reject) => query(settingsQuery, [], (e, r) => (e ? reject(e) : resolve(r))));
    res.json(settings || null);
  } catch (err) { next(err); }
});

module.exports = router;
