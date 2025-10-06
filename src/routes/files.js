const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Serve uploaded images
router.get('/images/:folderName/:imageName', (req, res) => {
  try {
    const { folderName, imageName } = req.params;
    const imagePath = path.join(__dirname, '../../uploads', folderName, imageName);
    
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    // Set appropriate content type
    const ext = path.extname(imageName).toLowerCase();
    const contentType = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    }[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.sendFile(imagePath);
  } catch (error) {
    console.error('Serve image error:', error);
    res.status(500).json({ success: false, message: 'Error serving image' });
  }
});

// Serve profile pictures
router.get('/user/:id', (req, res) => {
  try {
    const { id } = req.params;
    const imagePath = path.join(__dirname, '../../uploads/profiles', `profile-${id}.jpg`);
    
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ success: false, message: 'Profile picture not found' });
    }

    res.setHeader('Content-Type', 'image/jpeg');
    res.sendFile(imagePath);
  } catch (error) {
    console.error('Serve profile picture error:', error);
    res.status(500).json({ success: false, message: 'Error serving profile picture' });
  }
});

module.exports = router;