const UserInterest = require('../models/UserInterest');
const { asyncHandler } = require('../middleware/errorHandler');

class InterestsController {
  // Save user interests
  static saveUserInterests = asyncHandler(async (req, res) => {
    const { userId, interests, city, district } = req.body;

    // Validate required fields
    if (!userId || !interests || !Array.isArray(interests) || interests.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User identifier and interests are required'
      });
    }

    const result = await UserInterest.saveUserInterests(userId, interests, city, district);

    res.json({
      success: true,
      message: result.message,
      interestsCount: result.interestsCount
    });
  });

  // Get user interests
  static getUserInterests = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const interests = await UserInterest.getUserInterests(userId);

    res.json({
      success: true,
      interests
    });
  });

  // Get all available interests
  static getAllInterests = asyncHandler(async (req, res) => {
    const interests = await UserInterest.getAllInterests();

    res.json({
      success: true,
      interests
    });
  });

  // Get users by interest
  static getUsersByInterest = asyncHandler(async (req, res) => {
    const { interest } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;
    const users = await UserInterest.getUsersByInterest(interest, parseInt(limit), offset);

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: users.length
      }
    });
  });

  // Delete user interests
  static deleteUserInterests = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const deletedCount = await UserInterest.deleteUserInterests(userId);

    res.json({
      success: true,
      message: 'User interests deleted successfully',
      deletedCount
    });
  });
}

module.exports = InterestsController;