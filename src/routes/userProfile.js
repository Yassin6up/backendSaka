const express = require('express');
const router = express.Router();
const UserProfileController = require('../controllers/userProfileController');
const { authenticateUser } = require('../middleware/auth');

// Get user profile with posts
router.get('/user/:userId', authenticateUser, UserProfileController.getUserProfile);

// Get profile places
router.get('/profile/places', UserProfileController.getProfilePlaces);

module.exports = router;