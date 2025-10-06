const express = require('express');
const { query } = require('../config/db');

const router = express.Router();

router.get('/slugs', async (req, res, next) => {
  try {
    const querySql = `
      SELECT slug FROM categories_booking WHERE isActive = 1
      UNION ALL
      SELECT slug FROM categories_rent WHERE isActive = 1
      UNION ALL
      SELECT slug FROM categories_sale WHERE isActive = 1
    `;
    const rows = await new Promise((resolve, reject) => query(querySql, [], (e, r) => (e ? reject(e) : resolve(r))));
    res.json(rows);
  } catch (err) { next(err); }
});

router.get('/all', async (req, res, next) => {
  try {
    const querySale = 'SELECT * FROM categories_sale WHERE isActive = 1';
    const queryRent = 'SELECT * FROM categories_rent WHERE isActive = 1';
    const queryBooking = 'SELECT * FROM categories_booking WHERE isActive = 1';
    const [sale, rent, booking] = await Promise.all([
      new Promise((resolve, reject) => query(querySale, [], (e, r) => (e ? reject(e) : resolve(r)))),
      new Promise((resolve, reject) => query(queryRent, [], (e, r) => (e ? reject(e) : resolve(r)))),
      new Promise((resolve, reject) => query(queryBooking, [], (e, r) => (e ? reject(e) : resolve(r)))),
    ]);
    res.json({ sale, rent, booking });
  } catch (err) { next(err); }
});

router.put('/toggle/:slug', async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const { table } = req.body; // Expected: categories_sale|categories_rent|categories_booking
    const row = await new Promise((resolve, reject) =>
      query(`SELECT isActive FROM ${table} WHERE slug = ?`, [slug], (e, r) => (e ? reject(e) : resolve(r)))
    );
    if (!row || row.length === 0) return res.status(404).json({ message: 'Category not found' });
    const newVal = row[0].isActive ? 0 : 1;
    await new Promise((resolve, reject) =>
      query(`UPDATE ${table} SET isActive = ? WHERE slug = ?`, [newVal, slug], (e) => (e ? reject(e) : resolve()))
    );
    res.json({ slug, isActive: newVal });
  } catch (err) { next(err); }
});

module.exports = router;
