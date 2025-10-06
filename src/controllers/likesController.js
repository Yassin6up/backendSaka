const Like = require('../models/Like');
const { asyncHandler } = require('../middleware/errorHandler');

class LikesController {
  // Toggle like for a place
  static toggleLike = asyncHandler(async (req, res) => {
    const { user_id, place_id } = req.body;

    if (!user_id || !place_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Place ID are required'
      });
    }

    const result = await Like.toggleLike(user_id, place_id);

    res.json({
      success: true,
      message: `Place ${result.action} successfully`,
      liked: result.liked
    });
  });

  // Get user's liked places
  static getUserLikes = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;
    const likes = await Like.getUserLikes(userId, parseInt(limit), offset);

    res.json({
      success: true,
      likes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: likes.length
      }
    });
  });

  // Get like count for a place
  static getPlaceLikeCount = asyncHandler(async (req, res) => {
    const { placeId } = req.params;

    const count = await Like.getPlaceLikeCount(placeId);

    res.json({
      success: true,
      likeCount: count
    });
  });

  // Check if user liked a place
  static checkUserLike = asyncHandler(async (req, res) => {
    const { userId, placeId } = req.params;

    const hasLiked = await Like.hasUserLiked(userId, placeId);

    res.json({
      success: true,
      hasLiked
    });
  });
}

module.exports = LikesController;