const express = require('express');
const router = express.Router();
const LikesController = require('../controllers/likesController');
const { authenticateUser } = require('../middleware/auth');

// All like routes require authentication
router.use(authenticateUser);

// Toggle like for a place
router.post('/like', LikesController.toggleLike);

// Get user's liked places
router.get('/api/user/:userId/likes', LikesController.getUserLikes);

// Get like count for a place
router.get('/places/:placeId/likes', LikesController.getPlaceLikeCount);

// Check if user liked a place
router.get('/user/:userId/place/:placeId/liked', LikesController.checkUserLike);

module.exports = router;