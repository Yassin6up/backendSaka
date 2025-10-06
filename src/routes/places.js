const express = require('express');
const router = express.Router();
const PlacesController = require('../controllers/placesController');
const { validatePlaceCreation } = require('../middleware/validation');
const { authenticateUser, authenticateAdmin } = require('../middleware/auth');
const { upload } = require('../config/upload');

// Public routes
router.get('/', PlacesController.getPlaces);
router.get('/search', PlacesController.searchPlaces);
router.get('/filter', PlacesController.filterPlaces);
router.get('/category-counts', PlacesController.getCategoryCounts);
router.get('/similar-products', PlacesController.getSimilarPlaces);
router.get('/:id', PlacesController.getPlaceById);

// Protected routes (require authentication)
router.post('/add', authenticateUser, validatePlaceCreation, upload.fields([
  { name: 'images', maxCount: 10 }
]), PlacesController.createPlace);

router.put('/:id', authenticateUser, PlacesController.updatePlace);
router.delete('/:id', authenticateUser, PlacesController.deletePlace);
router.get('/by-owner/:ownerId', authenticateUser, PlacesController.getPlacesByOwner);
router.post('/:id/toggle-active', authenticateUser, PlacesController.togglePlaceActive);

// Admin routes
router.get('/admin/places', authenticateAdmin, PlacesController.getPlaces);
router.put('/:id/approve', authenticateAdmin, PlacesController.approvePlace);
router.delete('/admin/places/:id', authenticateAdmin, PlacesController.deletePlace);

module.exports = router;