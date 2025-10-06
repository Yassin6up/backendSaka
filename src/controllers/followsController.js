const Follow = require('../models/Follow');
const notificationService = require('../services/notificationService');
const { asyncHandler } = require('../middleware/errorHandler');

class FollowsController {
  // Toggle follow relationship
  static toggleFollow = asyncHandler(async (req, res) => {
    const { followerId, followeeId } = req.body;

    if (!followerId || !followeeId) {
      return res.status(400).json({
        success: false,
        message: 'Follower ID and Followee ID are required'
      });
    }

    if (followerId === followeeId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot follow yourself'
      });
    }

    const result = await Follow.toggleFollow(followerId, followeeId);

    // Send notification if user started following
    if (result.following) {
      try {
        // Get follower's name
        const db = require('../config/database');
        const followerQuery = 'SELECT name FROM users WHERE id = ?';
        
        db.query(followerQuery, [followerId], (error, results) => {
          if (!error && results.length > 0) {
            const followerName = results[0].name;
            const notificationMessage = `لديك متابع جديد: ${followerName}`;
            
            // Save notification to database
            notificationService.saveNotification(
              followeeId,
              'متابع جديد',
              notificationMessage,
              'follow',
              { followerId }
            );
          }
        });
      } catch (error) {
        console.error('Error sending follow notification:', error);
        // Don't fail the follow action if notification fails
      }
    }

    res.json({
      success: true,
      message: `User ${result.action} successfully`,
      following: result.following
    });
  });

  // Get user's followers
  static getFollowers = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;
    const followers = await Follow.getFollowers(userId, parseInt(limit), offset);

    res.json({
      success: true,
      followers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: followers.length
      }
    });
  });

  // Get user's following
  static getFollowing = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;
    const following = await Follow.getFollowing(userId, parseInt(limit), offset);

    res.json({
      success: true,
      following,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: following.length
      }
    });
  });

  // Get follow counts for a user
  static getFollowCounts = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const counts = await Follow.getFollowCounts(userId);

    res.json({
      success: true,
      followersCount: counts.followers_count,
      followingCount: counts.following_count
    });
  });

  // Check if user is following another user
  static checkFollowStatus = asyncHandler(async (req, res) => {
    const { followerId, followeeId } = req.params;

    const isFollowing = await Follow.isFollowing(followerId, followeeId);

    res.json({
      success: true,
      isFollowing
    });
  });
}

module.exports = FollowsController;