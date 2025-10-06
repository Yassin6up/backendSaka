const express = require('express');
const path = require('path');
const fs = require('fs');
const { query } = require('../config/db');
const { uploadSliders, uploadServices, uploadIcons } = require('../middleware/uploads');

const router = express.Router();

// Sliders
router.post('/slides', uploadSliders.single('slide'), async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'Slide image is required' });
    await new Promise((resolve, reject) =>
      query('INSERT INTO sliders (file_name) VALUES (?)', [file.filename], (e) => (e ? reject(e) : resolve()))
    );
    res.json({ success: true, fileName: file.filename });
  } catch (err) { next(err); }
});

router.get('/slides', async (req, res, next) => {
  try {
    const rows = await new Promise((resolve, reject) => query('SELECT * FROM sliders', [], (e, r) => (e ? reject(e) : resolve(r))));
    res.json(rows);
  } catch (err) { next(err); }
});

router.get('/slides/single/:fileName', (req, res) => {
  const filePath = path.join(process.cwd(), 'uploads', 'sliders', req.params.fileName);
  if (fs.existsSync(filePath)) return res.sendFile(filePath);
  res.status(404).json({ message: 'Slide not found' });
});

router.delete('/slides/:fileName', async (req, res, next) => {
  try {
    const fileName = req.params.fileName;
    const filePath = path.join(process.cwd(), 'uploads', 'sliders', fileName);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await new Promise((resolve, reject) => query('DELETE FROM sliders WHERE file_name = ?', [fileName], (e) => (e ? reject(e) : resolve())));
    res.json({ success: true });
  } catch (err) { next(err); }
});

// Services
router.post('/', uploadServices.single('icon'), async (req, res, next) => {
  try {
    const file = req.file;
    const { title_ar, title_en, is_car_service } = req.body;
    await new Promise((resolve, reject) =>
      query('INSERT INTO services (title_ar, title_en, icon, is_car_service) VALUES (?, ?, ?, ?)', [title_ar, title_en, file?.filename || null, is_car_service ? 1 : 0], (e) => (e ? reject(e) : resolve()))
    );
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.put('/:id', uploadServices.single('icon'), async (req, res, next) => {
  try {
    const file = req.file;
    const id = req.params.id;
    const { title_ar, title_en, is_car_service } = req.body;
    await new Promise((resolve, reject) =>
      query('UPDATE services SET title_ar = ?, title_en = ?, icon = ?, is_car_service = ? WHERE id = ?', [title_ar, title_en, file?.filename || null, is_car_service ? 1 : 0, id], (e) => (e ? reject(e) : resolve()))
    );
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    await new Promise((resolve, reject) => query('DELETE FROM services WHERE id = ?', [id], (e) => (e ? reject(e) : resolve())));
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const rows = await new Promise((resolve, reject) => query('SELECT * FROM services ORDER BY created_at DESC', [], (e, r) => (e ? reject(e) : resolve(r))));
    res.json(rows);
  } catch (err) { next(err); }
});

router.get('/single/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const [row] = await new Promise((resolve, reject) => query('SELECT * FROM services WHERE id = ?', [id], (e, r) => (e ? reject(e) : resolve(r))));
    if (!row) return res.status(404).json({ message: 'Service not found' });
    res.json(row);
  } catch (err) { next(err); }
});

router.get('/car', async (req, res, next) => {
  try {
    const rows = await new Promise((resolve, reject) => query('SELECT * FROM services WHERE is_car_service = 1', [], (e, r) => (e ? reject(e) : resolve(r))));
    res.json(rows);
  } catch (err) { next(err); }
});

// Legacy path without /api prefix
router.get('/services/car', async (req, res, next) => {
  try {
    const rows = await new Promise((resolve, reject) => query('SELECT * FROM services WHERE is_car_service = 1', [], (e, r) => (e ? reject(e) : resolve(r))));
    res.json(rows);
  } catch (err) { next(err); }
});

// Serve single icon by filename (legacy /api/icons/single/:fileName)
router.get('/icons/single/:fileName', (req, res) => {
  const filePath = path.join(process.cwd(), 'uploads', 'icons', req.params.fileName);
  if (fs.existsSync(filePath)) return res.sendFile(filePath);
  res.status(404).json({ message: 'Icon not found' });
});

module.exports = router;
