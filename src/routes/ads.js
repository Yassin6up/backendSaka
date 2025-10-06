const express = require('express');
const router = express.Router();
const AdsController = require('../controllers/adsController');
const { authenticateUser, authenticateAdmin } = require('../middleware/auth');
const { upload } = require('../config/upload');

// Update ads
router.post('/ads/update/:id', authenticateUser, upload.array('newPhotos'), AdsController.updateAds);

// Get ads by owner
router.get('/ads/owner/:ownerId', AdsController.getAdsByOwner);

// Get all ads
router.get('/api/ads', AdsController.getAllAds);

module.exports = router;