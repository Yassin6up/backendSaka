const express = require('express');
const router = express.Router();
const ServicesController = require('../controllers/servicesController');
const { authenticateAdmin } = require('../middleware/auth');
const { upload } = require('../config/upload');

// Public routes
router.get('/api/services', ServicesController.getAllServices);
router.get('/api/getOnce/services/:id', ServicesController.getServiceById);
router.get('/services/car', ServicesController.getCarServices);

// Admin routes
router.post('/api/services', authenticateAdmin, upload.single('icon'), ServicesController.createService);
router.put('/api/services/:id', authenticateAdmin, upload.single('icon'), ServicesController.updateService);
router.delete('/api/services/:id', authenticateAdmin, ServicesController.deleteService);
router.put('/api/services/:id/toggle', authenticateAdmin, ServicesController.toggleServiceActive);

module.exports = router;