const express = require('express');
const router = express.Router();
const { BookingController } = require('../controllers');
const { auth } = require('../middleware');

// Protected routes
router.post('/add', auth.verifyUserToken, BookingController.createBooking);
router.get('/', auth.verifyUserToken, BookingController.getBookings);
router.get('/user', auth.verifyUserToken, BookingController.getUserBookings);
router.get('/owner', auth.verifyUserToken, BookingController.getOwnerBookings);
router.get('/:id', auth.verifyUserToken, BookingController.getBookingById);
router.put('/:id/status', auth.verifyUserToken, BookingController.updateBookingStatus);
router.delete('/:id', auth.verifyUserToken, BookingController.deleteBooking);
router.get('/titles/:placeId', auth.verifyUserToken, BookingController.getBookingTitles);

module.exports = router;