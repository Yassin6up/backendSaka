const Booking = require('../models/Booking');
const { asyncHandler } = require('../middleware/errorHandler');

class BookingsController {
  // Create new booking
  static createBooking = asyncHandler(async (req, res) => {
    const { place_id, user_id, booking_date, message } = req.body;

    const booking = await Booking.create({
      place_id,
      user_id,
      booking_date,
      message
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: {
        id: booking.id,
        place_id: booking.place_id,
        user_id: booking.user_id,
        booking_date: booking.booking_date,
        message: booking.message,
        status: booking.status
      }
    });
  });

  // Get all bookings
  static getAllBookings = asyncHandler(async (req, res) => {
    const { place_id, user_id, status, page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;
    const filters = { place_id, user_id, status };

    const bookings = await Booking.findAll(filters, parseInt(limit), offset);

    res.json({
      success: true,
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: bookings.length
      }
    });
  });

  // Get bookings by user
  static getBookingsByUser = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    const { page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const offset = (page - 1) * limit;
    const bookings = await Booking.findByUser(userId, parseInt(limit), offset);

    res.json({
      success: true,
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: bookings.length
      }
    });
  });

  // Update booking status
  static updateBookingStatus = asyncHandler(async (req, res) => {
    const { bookingId, status } = req.body;

    if (!bookingId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID and status are required'
      });
    }

    const validStatuses = ['pending', 'approved', 'rejected', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    await Booking.updateStatus(bookingId, status);

    res.json({
      success: true,
      message: 'Booking status updated successfully'
    });
  });

  // Get booking by ID
  static getBookingById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      booking
    });
  });

  // Get booking titles for a place
  static getBookingTitles = asyncHandler(async (req, res) => {
    const { place_id } = req.params;

    const titles = await Booking.getTitlesByPlace(place_id);

    res.json({
      success: true,
      titles
    });
  });

  // Delete booking
  static deleteBooking = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    await booking.delete();

    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  });
}

module.exports = BookingsController;