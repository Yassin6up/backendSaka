const express = require('express');
const router = express.Router();
const InterestsController = require('../controllers/interestsController');
const { authenticateUser } = require('../middleware/auth');

// Save user interests
router.post('/user/interests', authenticateUser, InterestsController.saveUserInterests);

// Get user interests
router.get('/user/:userId/interests', authenticateUser, InterestsController.getUserInterests);

// Get all available interests
router.get('/api/interests', InterestsController.getAllInterests);

// Get users by interest
router.get('/api/interests/:interest/users', InterestsController.getUsersByInterest);

// Delete user interests
router.delete('/user/:userId/interests', authenticateUser, InterestsController.deleteUserInterests);

module.exports = router;