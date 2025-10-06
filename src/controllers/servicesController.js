const Service = require('../models/Service');
const { asyncHandler } = require('../middleware/errorHandler');

class ServicesController {
  // Create a new service
  static createService = asyncHandler(async (req, res) => {
    const { name, description, is_car_service = 0 } = req.body;
    const icon = req.file ? `/uploads/services/${req.file.filename}` : null;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Name and description are required'
      });
    }

    const service = await Service.create({
      name,
      description,
      icon,
      is_car_service
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service: {
        id: service.id,
        name: service.name,
        description: service.description,
        icon: service.icon,
        is_car_service: service.is_car_service
      }
    });
  });

  // Get all services
  static getAllServices = asyncHandler(async (req, res) => {
    const { is_car_service, is_active } = req.query;
    
    const filters = {};
    if (is_car_service !== undefined) {
      filters.is_car_service = parseInt(is_car_service);
    }
    if (is_active !== undefined) {
      filters.is_active = parseInt(is_active);
    }

    const services = await Service.findAll(filters);

    res.json({
      success: true,
      services
    });
  });

  // Get service by ID
  static getServiceById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      service
    });
  });

  // Update service
  static updateService = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, is_car_service } = req.body;
    const icon = req.file ? `/uploads/services/${req.file.filename}` : undefined;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    const updateData = { name, description, is_car_service, icon };
    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await service.update(updateData);

    res.json({
      success: true,
      message: 'Service updated successfully',
      service
    });
  });

  // Delete service
  static deleteService = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    await service.delete();

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  });

  // Toggle service active status
  static toggleServiceActive = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    await service.toggleActive();

    res.json({
      success: true,
      message: `Service ${service.is_active ? 'activated' : 'deactivated'} successfully`,
      service: {
        id: service.id,
        is_active: service.is_active
      }
    });
  });

  // Get car services
  static getCarServices = asyncHandler(async (req, res) => {
    const services = await Service.findAll({ is_car_service: 1, is_active: 1 });

    res.json({
      success: true,
      services
    });
  });
}

module.exports = ServicesController;