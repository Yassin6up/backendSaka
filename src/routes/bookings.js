const express = require('express');
const { query } = require('../config/db');

const router = express.Router();

// Placeholder to migrate booking routes step-by-step
router.get('/', async (req, res, next) => {
  try {
    const rows = await new Promise((resolve, reject) => query('SELECT * FROM bookings LIMIT 50', [], (e, r) => (e ? reject(e) : resolve(r))));
    res.json(rows);
  } catch (err) { next(err); }
});

module.exports = router;
