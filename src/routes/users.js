const express = require('express');
const path = require('path');
const fs = require('fs');
const { query } = require('../config/db');
const { uploadProfiles } = require('../middleware/uploads');

const router = express.Router();

// GET /user/blocked-status/:userId
router.get('/user/blocked-status/:userId', async (req, res, next) => {
  try {
    const sessionToken = req.params.userId;
    const [row] = await new Promise((resolve, reject) =>
      query('SELECT blocked FROM users WHERE session_token = ?', [sessionToken], (e, r) => (e ? reject(e) : resolve(r)))
    );
    if (!row) return res.status(404).json({ error: 'User not found' });
    res.json({ blocked: row.blocked });
  } catch (err) { next(err); }
});

// POST /toggle_blocked/:id
router.post('/toggle_blocked/:id', async (req, res, next) => {
  try {
    const userId = req.params.id;
    const [row] = await new Promise((resolve, reject) =>
      query('SELECT blocked FROM users WHERE id = ?', [userId], (e, r) => (e ? reject(e) : resolve(r)))
    );
    if (!row) return res.status(404).json({ error: 'User not found' });
    const newValue = row.blocked === 1 ? 0 : 1;
    await new Promise((resolve, reject) =>
      query('UPDATE users SET blocked = ? WHERE id = ?', [newValue, userId], (e) => (e ? reject(e) : resolve()))
    );
    res.json({ blocked: newValue });
  } catch (err) { next(err); }
});

// POST /toggle_trustable/:id
router.post('/toggle_trustable/:id', async (req, res, next) => {
  try {
    const userId = req.params.id;
    const [row] = await new Promise((resolve, reject) =>
      query('SELECT trustable FROM users WHERE id = ?', [userId], (e, r) => (e ? reject(e) : resolve(r)))
    );
    if (!row) return res.status(404).json({ error: 'User not found' });
    const newValue = row.trustable === 1 ? 0 : 1;
    await new Promise((resolve, reject) =>
      query('UPDATE users SET trustable = ? WHERE id = ?', [newValue, userId], (e) => (e ? reject(e) : resolve()))
    );
    res.json({ trustable: newValue });
  } catch (err) { next(err); }
});

// POST /update-picture/user
router.post('/update-picture/user', uploadProfiles.single('imageFile'), async (req, res, next) => {
  try {
    const { id, picture_url } = req.body;
    const imageFile = req.file;
    if (!id || !picture_url) {
      return res.status(400).json({ message: 'User ID and picture are required' });
    }
    let imageName = picture_url;
    if (imageFile) {
      imageName = `${Date.now()}-${imageFile.originalname}`;
      const destPath = path.join(process.cwd(), 'uploads', 'profiles', imageName);
      fs.renameSync(imageFile.path, destPath);
    }
    await new Promise((resolve, reject) =>
      query('UPDATE users SET picture_url = ?, image_name = ? WHERE id = ?', [picture_url, imageName, id], (e) =>
        e ? reject(e) : resolve()
      )
    );
    res.status(200).json({ message: 'Profile picture updated successfully', imageName });
  } catch (err) { next(err); }
});

// GET /user/profile-picture/:imageName
router.get('/user/profile-picture/:imageName', (req, res) => {
  const imagePath = path.join(process.cwd(), 'uploads', 'profiles', req.params.imageName);
  if (fs.existsSync(imagePath)) return res.sendFile(imagePath);
  res.status(404).json({ message: 'Image not found' });
});

// POST /user/update-user
router.post('/user/update-user', async (req, res, next) => {
  try {
    const { id, name, password, currentpass } = req.body;
    if (!id || (!name && !password)) {
      return res.status(400).json({ message: 'Provide user ID and at least one field (name, password) to update' });
    }
    if (!currentpass) return res.status(200).json({ message: 'Provide current password to update' });

    const rows = await new Promise((resolve, reject) =>
      query('SELECT password FROM users WHERE id = ?', [id], (e, r) => (e ? reject(e) : resolve(r)))
    );
    if (rows.length === 0) return res.status(200).json({ message: 'User not found' });
    if (currentpass !== rows[0].password) return res.status(200).json({ message: 'Current password does not match' });

    const updateFields = [];
    const values = [];
    if (name) { updateFields.push('name = ?'); values.push(name); }
    if (password) { updateFields.push('password = ?'); values.push(password); }
    values.push(id);

    await new Promise((resolve, reject) =>
      query(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`, values, (e) => (e ? reject(e) : resolve()))
    );

    const [user] = await new Promise((resolve, reject) =>
      query('SELECT * FROM users WHERE id = ?', [id], (e, r) => (e ? reject(e) : resolve(r)))
    );
    res.status(200).json({ message: 'User updated successfully', user });
  } catch (err) { next(err); }
});

// POST /user/update-name
router.post('/user/update-name', async (req, res, next) => {
  try {
    const { id, name, description } = req.body;
    if (!id) return res.status(400).json({ message: 'User id is required' });
    await new Promise((resolve, reject) =>
      query('UPDATE users SET name = ?, description = ? WHERE id = ?', [name, description, id], (e) => (e ? reject(e) : resolve()))
    );
    const [user] = await new Promise((resolve, reject) =>
      query('SELECT * FROM users WHERE id = ?', [id], (e, r) => (e ? reject(e) : resolve(r)))
    );
    res.json({ message: 'Name updated successfully', user });
  } catch (err) { next(err); }
});

// POST /user/phone-verification
router.post('/user/phone-verification', async (req, res, next) => {
  try {
    const { id, phone } = req.body;
    if (!id || !phone) return res.status(400).json({ message: 'id and phone required' });
    await new Promise((resolve, reject) =>
      query('UPDATE users SET phone_verified = 1, phone = ? WHERE id = ?', [phone, id], (e) => (e ? reject(e) : resolve()))
    );
    res.json({ message: 'Phone verified and updated' });
  } catch (err) { next(err); }
});

// POST /user/update-phone
router.post('/user/update-phone', async (req, res, next) => {
  try {
    const userId = req.body.id;
    const phone = req.body.phone;
    await new Promise((resolve, reject) =>
      query('UPDATE users SET phone = ? WHERE id = ?', [phone, userId], (e) => (e ? reject(e) : resolve()))
    );
    const [user] = await new Promise((resolve, reject) =>
      query('SELECT * FROM users WHERE id = ?', [userId], (e, r) => (e ? reject(e) : resolve(r)))
    );
    res.json({ message: 'Phone updated successfully', user });
  } catch (err) { next(err); }
});

// GET /images/user/:id -> return image_name
router.get('/images/user/:id', async (req, res, next) => {
  try {
    const userId = req.params.id;
    const [row] = await new Promise((resolve, reject) =>
      query('SELECT image_name FROM users WHERE id = ?', [userId], (e, r) => (e ? reject(e) : resolve(r)))
    );
    if (!row) return res.status(404).json({ message: 'User not found' });
    res.json({ image_name: row.image_name });
  } catch (err) { next(err); }
});

module.exports = router;
