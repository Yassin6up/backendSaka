const path = require('path');
const fs = require('fs');
const { db } = require('../config/db');
const { profileUpload } = require('../middlewares/multer');

function updatePicture(req, res) {
  const { id, picture_url } = req.body;
  const imageFile = req.file;
  if (!id || !picture_url) return res.status(400).json({ message: 'User ID and picture are required' });

  let imageName = picture_url;
  if (imageFile) {
    const uploadDir = path.join(process.cwd(), 'uploads', 'profiles');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    imageName = `${Date.now()}-${imageFile.originalname}`;
    const imagePath = path.join(uploadDir, imageName);
    fs.renameSync(imageFile.path, imagePath);
  }

  const sql = 'UPDATE users SET picture_url = ?, image_name = ? WHERE id = ?';
  db.query(sql, [picture_url, imageName, id], (error, result) => {
    if (error) return res.status(500).json({ message: 'Database error.' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'Profile picture updated successfully', imageName });
  });
}

function serveProfileImage(req, res) {
  const { imageName } = req.params;
  const imagePath = path.join(process.cwd(), 'uploads', 'profiles', imageName);
  if (fs.existsSync(imagePath)) return res.sendFile(imagePath);
  res.status(404).json({ message: 'Image not found' });
}

function getUserImageName(req, res) {
  const { id } = req.params;
  const query = 'SELECT image_name FROM users WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Internal server error' });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ image_name: results[0].image_name });
  });
}

module.exports = { updatePicture, serveProfileImage, getUserImageName, profileUpload };
