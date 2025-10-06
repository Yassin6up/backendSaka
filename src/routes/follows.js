const express = require('express');
const router = express.Router();
const FollowsController = require('../controllers/followsController');
const { authenticateUser } = require('../middleware/auth');

// All follow routes require authentication
router.use(authenticateUser);

// Toggle follow relationship
router.post('/follow/user', FollowsController.toggleFollow);

// Get user's followers
router.get('/user/:userId/followers', FollowsController.getFollowers);

// Get user's following
router.get('/user/:userId/following', FollowsController.getFollowing);

// Get follow counts for a user
router.get('/user/:userId/follow-counts', FollowsController.getFollowCounts);

// Check if user is following another user
router.get('/user/:followerId/following/:followeeId', FollowsController.checkFollowStatus);

module.exports = router;