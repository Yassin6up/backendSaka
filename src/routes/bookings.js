const express = require('express');
const router = express.Router();
const BookingsController = require('../controllers/bookingsController');
const { validateBooking } = require('../middleware/validation');
const { authenticateUser, authenticateAdmin } = require('../middleware/auth');

// All booking routes require authentication
router.use(authenticateUser);

// Create booking
router.post('/api/bookings/add', validateBooking, BookingsController.createBooking);

// Get all bookings (admin)
router.get('/get-all-bookings', authenticateAdmin, BookingsController.getAllBookings);

// Get bookings by user
router.post('/get-bookings-by-user', BookingsController.getBookingsByUser);

// Update booking status
router.post('/update-booking-status', BookingsController.updateBookingStatus);

// Get all bookings (public with filters)
router.get('/api/bookings', BookingsController.getAllBookings);

// Get booking titles for a place
router.get('/bookings/getTitles/:place_id', BookingsController.getBookingTitles);

// Get booking by ID
router.get('/api/bookings/get/:id', BookingsController.getBookingById);

// Delete booking
router.delete('/bookings/:id', BookingsController.deleteBooking);

module.exports = router;