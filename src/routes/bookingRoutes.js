const express = require('express');
const {
  addBooking,
  getAllBookings,
  getBookingsByUser,
  getBookings,
  getBookingTitles,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
} = require('../controllers/bookingController');

const router = express.Router();

router.post('/api/bookings/add', addBooking);
router.get('/get-all-bookings', getAllBookings);
router.post('/get-bookings-by-user', getBookingsByUser);
router.get('/api/bookings', getBookings);
router.get('/bookings/getTitles/:place_id', getBookingTitles);
router.get('/api/bookings/get/:id', getBookingById);
router.post('/update-booking-status', updateBookingStatus);
router.delete('/bookings/:id', deleteBooking);

module.exports = router;
