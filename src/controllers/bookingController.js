const { BookingService } = require('../services');
const { ResponseHelper, ValidationHelper } = require('../utils');

class BookingController {
  static async createBooking(req, res) {
    try {
      const bookingData = ValidationHelper.sanitizeObject(req.body);
      bookingData.user_id = req.user.id;

      // Validate booking data
      const validationErrors = ValidationHelper.validateBookingData(bookingData);
      if (validationErrors.length > 0) {
        return ResponseHelper.validationError(res, 'Validation failed', validationErrors);
      }

      const result = await BookingService.createBooking(bookingData);
      
      return ResponseHelper.success(res, { id: result.id }, 'Booking created successfully', 201);

    } catch (error) {
      console.error('Create booking error:', error);
      return ResponseHelper.error(res, 'Failed to create booking', 500, error);
    }
  }

  static async getBookings(req, res) {
    try {
      const filters = {
        user_id: req.query.user_id,
        owner_id: req.query.owner_id,
        status: req.query.status,
        limit: parseInt(req.query.limit) || 20
      };

      // Remove undefined filters
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined) {
          delete filters[key];
        }
      });

      const bookings = await BookingService.getBookings(filters);
      
      return ResponseHelper.success(res, bookings, 'Bookings retrieved successfully');

    } catch (error) {
      console.error('Get bookings error:', error);
      return ResponseHelper.error(res, 'Failed to retrieve bookings', 500, error);
    }
  }

  static async getBookingById(req, res) {
    try {
      const { id } = req.params;
      const booking = await BookingService.getBookingById(id);

      if (!booking) {
        return ResponseHelper.notFound(res, 'Booking not found');
      }

      return ResponseHelper.success(res, booking, 'Booking retrieved successfully');

    } catch (error) {
      console.error('Get booking by ID error:', error);
      return ResponseHelper.error(res, 'Failed to retrieve booking', 500, error);
    }
  }

  static async updateBookingStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return ResponseHelper.validationError(res, 'Status is required');
      }

      const validStatuses = ['pending', 'approved', 'rejected', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return ResponseHelper.validationError(res, 'Invalid status');
      }

      const result = await BookingService.updateBookingStatus(id, status);
      
      if (result.affectedRows === 0) {
        return ResponseHelper.notFound(res, 'Booking not found');
      }

      return ResponseHelper.success(res, null, 'Booking status updated successfully');

    } catch (error) {
      console.error('Update booking status error:', error);
      return ResponseHelper.error(res, 'Failed to update booking status', 500, error);
    }
  }

  static async deleteBooking(req, res) {
    try {
      const { id } = req.params;

      const result = await BookingService.deleteBooking(id);
      
      if (result.affectedRows === 0) {
        return ResponseHelper.notFound(res, 'Booking not found');
      }

      return ResponseHelper.success(res, null, 'Booking deleted successfully');

    } catch (error) {
      console.error('Delete booking error:', error);
      return ResponseHelper.error(res, 'Failed to delete booking', 500, error);
    }
  }

  static async getBookingTitles(req, res) {
    try {
      const { placeId } = req.params;
      const titles = await BookingService.getBookingTitles(placeId);
      
      return ResponseHelper.success(res, titles, 'Booking titles retrieved successfully');

    } catch (error) {
      console.error('Get booking titles error:', error);
      return ResponseHelper.error(res, 'Failed to retrieve booking titles', 500, error);
    }
  }

  static async getUserBookings(req, res) {
    try {
      const userId = req.user.id;
      const bookings = await BookingService.getBookings({ user_id: userId });
      
      return ResponseHelper.success(res, bookings, 'User bookings retrieved successfully');

    } catch (error) {
      console.error('Get user bookings error:', error);
      return ResponseHelper.error(res, 'Failed to retrieve user bookings', 500, error);
    }
  }

  static async getOwnerBookings(req, res) {
    try {
      const ownerId = req.user.id;
      const bookings = await BookingService.getBookings({ owner_id: ownerId });
      
      return ResponseHelper.success(res, bookings, 'Owner bookings retrieved successfully');

    } catch (error) {
      console.error('Get owner bookings error:', error);
      return ResponseHelper.error(res, 'Failed to retrieve owner bookings', 500, error);
    }
  }
}

module.exports = BookingController;