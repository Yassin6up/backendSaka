const PropertyRequest = require('../models/PropertyRequest');
const UserInterest = require('../models/UserInterest');
const { asyncHandler } = require('../middleware/errorHandler');

class RequestsController {
  // Create property request
  static createRequest = asyncHandler(async (req, res) => {
    const {
      requestType,
      propertyType,
      city,
      district,
      details,
      budget,
      paymentMethod,
      area,
      name,
      phone,
      userType
    } = req.body;

    // Validate required fields
    if (!requestType || !propertyType || !city || !name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Combine city and district into a single string
    const combinedCity = district ? `${city}, ${district}` : city;

    const requestData = {
      request_type: requestType,
      property_type: propertyType,
      city: combinedCity,
      details: details || null,
      budget_min: budget?.min || null,
      budget_max: budget?.max || null,
      payment_method: paymentMethod || null,
      area_min: area?.min || null,
      area_max: area?.max || null,
      name,
      phone,
      user_type: userType || 'buyer'
    };

    const request = await PropertyRequest.create(requestData);

    res.status(201).json({
      success: true,
      message: 'Request submitted successfully',
      requestId: request.id
    });
  });

  // Get all property requests
  static getAllRequests = asyncHandler(async (req, res) => {
    const { requestType, propertyType, city, userType, page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;
    const filters = { requestType, propertyType, city, userType };

    const requests = await PropertyRequest.findAll(filters, parseInt(limit), offset);

    res.json({
      success: true,
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: requests.length
      }
    });
  });

  // Get matching requests for user
  static getMatchingRequests = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Get user interests and location
    const userInterests = await UserInterest.getUserInterests(userId);

    if (userInterests.length === 0) {
      return res.json({
        success: true,
        message: 'No interests found for user',
        requests: []
      });
    }

    // Extract user's interests and location
    const interests = [...new Set(userInterests.map(item => item.interest))];
    const userCity = userInterests[0].city;
    const userDistrict = userInterests[0].district;

    // Get matching requests
    const matchingRequests = await PropertyRequest.getMatchingRequests(
      interests,
      userCity,
      userDistrict,
      20
    );

    res.json({
      success: true,
      userInterests: interests,
      userLocation: { city: userCity, district: userDistrict },
      matchingRequests
    });
  });

  // Get request by ID
  static getRequestById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const request = await PropertyRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    res.json({
      success: true,
      request
    });
  });

  // Update request
  static updateRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const request = await PropertyRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    await request.update(updateData);

    res.json({
      success: true,
      message: 'Request updated successfully',
      request
    });
  });

  // Delete request
  static deleteRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const request = await PropertyRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    await request.delete();

    res.json({
      success: true,
      message: 'Request deleted successfully'
    });
  });
}

module.exports = RequestsController;