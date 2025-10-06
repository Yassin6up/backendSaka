const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Booking routes
router.get('/', bookingController.getAllBookings);
router.get('/get/:id', bookingController.getBookingById);
router.get('/getTitles/:place_id', bookingController.getBookingTitles);

router.post('/add', bookingController.addBooking);
router.post('/get-bookings-by-user', bookingController.getBookingsByUser);
router.post('/update-booking-status', bookingController.updateBookingStatus);

router.delete('/:id', bookingController.deleteBooking);

module.exports = router;