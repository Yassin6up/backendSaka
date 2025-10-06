const express = require('express');
const { query } = require('../config/db');
const path = require('path');
const fs = require('fs');
const { uploadTemp } = require('../middleware/uploads');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Examples from original: counts by home_type
router.get('/category-counts', async (req, res, next) => {
  try {
    const rows = await new Promise((resolve, reject) =>
      query(
        `SELECT home_type, COUNT(*) as count FROM places WHERE home_type IN ('فيلا / منزل', 'مسابح', 'صالات رياضة', 'مكاتب وعيادات', 'شقة', 'مزرعة', 'ارض', 'شليهات', 'قاعات اجتماعات', 'تنضيم رحلات', 'ملاعب', 'صالات رياضة') GROUP BY home_type`,
        [],
        (e, r) => (e ? reject(e) : resolve(r))
      )
    );
    const categoryCounts = {};
    rows.forEach((row) => (categoryCounts[row.home_type] = row.count));
    res.json(categoryCounts);
  } catch (err) { next(err); }
});

// Serve stored images for places (legacy /api/images/:folderName/:imageName)
router.get('/images/:folderName/:imageName', (req, res) => {
  const { folderName, imageName } = req.params;
  const filePath = path.join(process.cwd(), 'uploads', folderName, imageName);
  if (fs.existsSync(filePath)) return res.sendFile(filePath);
  res.status(404).json({ message: 'File not found' });
});

// Fetch approved/active places with optional filters (legacy /api/places)
router.get('/', async (req, res, next) => {
  try {
    const { category, type } = req.query;
    let sql = 'SELECT * FROM places WHERE approved = ? AND active = ?';
    const params = [1, 1];
    if (type) { sql += ' AND buy_or_rent = ?'; params.push(type); }
    if (category && category.toLowerCase() !== 'الكل') { sql += ' AND home_type LIKE ?'; params.push(`%${category}%`); }
    const rows = await new Promise((resolve, reject) => query(sql, params, (e, r) => (e ? reject(e) : resolve(r))));
    res.json({ places: rows.reverse() });
  } catch (err) { next(err); }
});

// Get single place with liked/trustable and increment viewers (legacy /api/places/:id)
router.get('/:id', async (req, res, next) => {
  try {
    const placeId = req.params.id;
    const userId = req.query.user_id;
    const sql = `
      SELECT p.*, 
             CASE WHEN f.user_id IS NOT NULL THEN 1 ELSE 0 END AS liked,
             u.picture_url AS owner_picture,
             u.trustable,
             u.image_name AS owner_image_name
      FROM places p
      LEFT JOIN favorites f ON p.id = f.place_id AND f.user_id = ?
      LEFT JOIN users u ON p.owner_id = u.id
      WHERE p.id = ?`;
    const rows = await new Promise((resolve, reject) => query(sql, [userId, placeId], (e, r) => (e ? reject(e) : resolve(r))));
    if (rows.length === 0) return res.status(404).json({ message: 'Place not found' });
    await new Promise((resolve) => query('UPDATE places SET viewers = viewers + 1 WHERE id = ?', [placeId], () => resolve()));
    res.json(rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
