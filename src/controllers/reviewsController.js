const Review = require('../models/Review');
const { asyncHandler } = require('../middleware/errorHandler');

class ReviewsController {
  // Add a new review
  static addReview = asyncHandler(async (req, res) => {
    const { place_id, user_id, comment, rating } = req.body;

    if (!place_id || !user_id || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Place ID, User ID, and rating are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if user has already reviewed this place
    const hasReviewed = await Review.hasUserReviewed(place_id, user_id);
    if (hasReviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this place'
      });
    }

    const review = await Review.create({
      place_id,
      user_id,
      comment: comment || '',
      rating
    });

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review: {
        id: review.id,
        place_id: review.place_id,
        user_id: review.user_id,
        comment: review.comment,
        rating: review.rating
      }
    });
  });

  // Get reviews for a place
  static getPlaceReviews = asyncHandler(async (req, res) => {
    const { place_id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;
    const reviews = await Review.getByPlace(place_id, parseInt(page), parseInt(limit));
    const summary = await Review.getSummary(place_id);

    res.json({
      success: true,
      reviews,
      summary: {
        total_reviews: summary.total_reviews || 0,
        average_rating: summary.average_rating ? parseFloat(summary.average_rating).toFixed(1) : 0
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: reviews.length
      }
    });
  });

  // Get user's reviews
  static getUserReviews = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;
    const reviews = await Review.getByUser(userId, parseInt(limit), offset);

    res.json({
      success: true,
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: reviews.length
      }
    });
  });

  // Update review
  static updateReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const { comment, rating } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    await review.update({ comment, rating });

    res.json({
      success: true,
      message: 'Review updated successfully',
      review
    });
  });

  // Delete review
  static deleteReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.delete();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  });
}

module.exports = ReviewsController;