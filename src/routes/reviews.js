const express = require('express');
const router = express.Router();
const ReviewsController = require('../controllers/reviewsController');
const { authenticateUser } = require('../middleware/auth');

// All review routes require authentication
router.use(authenticateUser);

// Add review
router.post('/reviews/add', ReviewsController.addReview);

// Get reviews for a place
router.get('/reviews/:place_id', ReviewsController.getPlaceReviews);

// Get user's reviews
router.get('/user/:userId/reviews', ReviewsController.getUserReviews);

// Update review
router.put('/reviews/:reviewId', ReviewsController.updateReview);

// Delete review
router.delete('/comments/:reviewId', ReviewsController.deleteReview);

module.exports = router;