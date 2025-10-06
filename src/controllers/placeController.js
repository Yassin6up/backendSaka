const { PlaceService } = require('../services');
const { ResponseHelper, ValidationHelper } = require('../utils');

class PlaceController {
  static async createPlace(req, res) {
    try {
      const placeData = ValidationHelper.sanitizeObject(req.body);
      placeData.owner_id = req.user.id;

      // Validate place data
      const validationErrors = ValidationHelper.validatePlaceData(placeData);
      if (validationErrors.length > 0) {
        return ResponseHelper.validationError(res, 'Validation failed', validationErrors);
      }

      // Process uploaded images
      if (req.files && req.files.length > 0) {
        const images = req.files.map(file => ({
          filename: file.filename,
          originalName: file.originalname,
          path: file.path
        }));
        placeData.images = images;
      }

      const result = await PlaceService.createPlace(placeData);
      
      return ResponseHelper.success(res, { id: result.id }, 'Place created successfully', 201);

    } catch (error) {
      console.error('Create place error:', error);
      return ResponseHelper.error(res, 'Failed to create place', 500, error);
    }
  }

  static async getPlaces(req, res) {
    try {
      const filters = {
        category: req.query.category,
        city: req.query.city,
        property_type: req.query.property_type,
        buy_or_rent: req.query.buy_or_rent,
        min_price: req.query.min_price,
        max_price: req.query.max_price,
        limit: parseInt(req.query.limit) || 20
      };

      // Remove undefined filters
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined) {
          delete filters[key];
        }
      });

      const places = await PlaceService.getPlaces(filters);
      
      return ResponseHelper.success(res, places, 'Places retrieved successfully');

    } catch (error) {
      console.error('Get places error:', error);
      return ResponseHelper.error(res, 'Failed to retrieve places', 500, error);
    }
  }

  static async getPlaceById(req, res) {
    try {
      const { id } = req.params;
      const place = await PlaceService.getPlaceById(id);

      if (!place) {
        return ResponseHelper.notFound(res, 'Place not found');
      }

      return ResponseHelper.success(res, place, 'Place retrieved successfully');

    } catch (error) {
      console.error('Get place by ID error:', error);
      return ResponseHelper.error(res, 'Failed to retrieve place', 500, error);
    }
  }

  static async updatePlace(req, res) {
    try {
      const { id } = req.params;
      const updateData = ValidationHelper.sanitizeObject(req.body);

      // Check if place exists and user owns it
      const place = await PlaceService.getPlaceById(id);
      if (!place) {
        return ResponseHelper.notFound(res, 'Place not found');
      }

      if (place.owner_id !== req.user.id) {
        return ResponseHelper.forbidden(res, 'You can only update your own places');
      }

      // Process uploaded images if any
      if (req.files && req.files.length > 0) {
        const images = req.files.map(file => ({
          filename: file.filename,
          originalName: file.originalname,
          path: file.path
        }));
        updateData.images = images;
      }

      await PlaceService.updatePlace(id, updateData);
      
      return ResponseHelper.success(res, null, 'Place updated successfully');

    } catch (error) {
      console.error('Update place error:', error);
      return ResponseHelper.error(res, 'Failed to update place', 500, error);
    }
  }

  static async deletePlace(req, res) {
    try {
      const { id } = req.params;

      // Check if place exists and user owns it
      const place = await PlaceService.getPlaceById(id);
      if (!place) {
        return ResponseHelper.notFound(res, 'Place not found');
      }

      if (place.owner_id !== req.user.id) {
        return ResponseHelper.forbidden(res, 'You can only delete your own places');
      }

      await PlaceService.deletePlace(id);
      
      return ResponseHelper.success(res, null, 'Place deleted successfully');

    } catch (error) {
      console.error('Delete place error:', error);
      return ResponseHelper.error(res, 'Failed to delete place', 500, error);
    }
  }

  static async getUserPlaces(req, res) {
    try {
      const { ownerId } = req.params;
      const places = await PlaceService.getPlacesByOwner(ownerId);
      
      return ResponseHelper.success(res, places, 'User places retrieved successfully');

    } catch (error) {
      console.error('Get user places error:', error);
      return ResponseHelper.error(res, 'Failed to retrieve user places', 500, error);
    }
  }

  static async searchPlaces(req, res) {
    try {
      const { q } = req.query;
      const filters = {
        category: req.query.category,
        city: req.query.city,
        limit: parseInt(req.query.limit) || 20
      };

      if (!q) {
        return ResponseHelper.validationError(res, 'Search query is required');
      }

      // Remove undefined filters
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined) {
          delete filters[key];
        }
      });

      const places = await PlaceService.searchPlaces(q, filters);
      
      return ResponseHelper.success(res, places, 'Search results retrieved successfully');

    } catch (error) {
      console.error('Search places error:', error);
      return ResponseHelper.error(res, 'Failed to search places', 500, error);
    }
  }

  static async toggleActive(req, res) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const place = await PlaceService.getPlaceById(id);
      if (!place) {
        return ResponseHelper.notFound(res, 'Place not found');
      }

      await PlaceService.updatePlace(id, { is_active: isActive ? 1 : 0 });
      
      return ResponseHelper.success(res, null, 'Place status updated successfully');

    } catch (error) {
      console.error('Toggle place active error:', error);
      return ResponseHelper.error(res, 'Failed to update place status', 500, error);
    }
  }
}

module.exports = PlaceController;