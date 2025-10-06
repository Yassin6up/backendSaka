const Place = require('../models/Place');
const { asyncHandler } = require('../middleware/errorHandler');

class PlacesController {
  // Get all places with filters
  static getPlaces = asyncHandler(async (req, res) => {
    const {
      category,
      city,
      district,
      minPrice,
      maxPrice,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const offset = (page - 1) * limit;
    const filters = {
      category,
      city,
      district,
      minPrice: minPrice ? parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
      search
    };

    const places = await Place.findAll(filters, parseInt(limit), offset);

    res.json({
      success: true,
      places,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: places.length
      }
    });
  });

  // Get place by ID
  static getPlaceById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const place = await Place.findById(id);
    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Place not found'
      });
    }

    // Increment views
    await place.incrementViews();

    res.json({
      success: true,
      place
    });
  });

  // Create new place
  static createPlace = asyncHandler(async (req, res) => {
    const {
      title,
      description,
      price,
      category,
      city,
      district,
      owner_id,
      images = []
    } = req.body;

    const place = await Place.create({
      title,
      description,
      price,
      category,
      city,
      district,
      owner_id,
      images
    });

    res.status(201).json({
      success: true,
      message: 'Place created successfully',
      place: {
        id: place.id,
        title: place.title,
        description: place.description,
        price: place.price,
        category: place.category,
        city: place.city,
        district: place.district,
        owner_id: place.owner_id,
        images: place.images
      }
    });
  });

  // Update place
  static updatePlace = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const place = await Place.findById(id);
    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Place not found'
      });
    }

    // Check if user owns this place
    if (place.owner_id !== updateData.owner_id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own places'
      });
    }

    await place.update(updateData);

    res.json({
      success: true,
      message: 'Place updated successfully',
      place
    });
  });

  // Delete place
  static deletePlace = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { owner_id } = req.body;

    const place = await Place.findById(id);
    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Place not found'
      });
    }

    // Check if user owns this place
    if (place.owner_id !== owner_id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own places'
      });
    }

    await place.delete();

    res.json({
      success: true,
      message: 'Place deleted successfully'
    });
  });

  // Get places by owner
  static getPlacesByOwner = asyncHandler(async (req, res) => {
    const { ownerId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;
    const places = await Place.findByOwner(ownerId, parseInt(limit), offset);

    res.json({
      success: true,
      places,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: places.length
      }
    });
  });

  // Search places
  static searchPlaces = asyncHandler(async (req, res) => {
    const { q, category, city, district, minPrice, maxPrice, page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;
    const filters = {
      search: q,
      category,
      city,
      district,
      minPrice: minPrice ? parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined
    };

    const places = await Place.findAll(filters, parseInt(limit), offset);

    res.json({
      success: true,
      places,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: places.length
      }
    });
  });

  // Get similar places
  static getSimilarPlaces = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { limit = 5 } = req.query;

    const place = await Place.findById(id);
    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Place not found'
      });
    }

    const similarPlaces = await Place.getSimilar(place.id, place.category, parseInt(limit));

    res.json({
      success: true,
      places: similarPlaces
    });
  });

  // Get category counts
  static getCategoryCounts = asyncHandler(async (req, res) => {
    const counts = await Place.getCategoryCounts();

    res.json({
      success: true,
      categories: counts
    });
  });

  // Toggle place active status
  static togglePlaceActive = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const place = await Place.findById(id);
    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Place not found'
      });
    }

    await place.toggleActive();

    res.json({
      success: true,
      message: `Place ${place.is_active ? 'activated' : 'deactivated'} successfully`,
      place: {
        id: place.id,
        is_active: place.is_active
      }
    });
  });

  // Approve place (admin only)
  static approvePlace = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const place = await Place.findById(id);
    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Place not found'
      });
    }

    await place.approve();

    res.json({
      success: true,
      message: 'Place approved successfully',
      place: {
        id: place.id,
        is_approved: place.is_approved
      }
    });
  });

  // Filter places
  static filterPlaces = asyncHandler(async (req, res) => {
    const filters = req.body;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;
    const places = await Place.findAll(filters, parseInt(limit), offset);

    res.json({
      success: true,
      places,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: places.length
      }
    });
  });
}

module.exports = PlacesController;