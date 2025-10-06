const express = require('express');
const router = express.Router();
const { PlaceController } = require('../controllers');
const { auth, multer } = require('../middleware');

// Public routes
router.get('/', PlaceController.getPlaces);
router.get('/search', PlaceController.searchPlaces);
router.get('/:id', PlaceController.getPlaceById);
router.get('/by-owner/:ownerId', PlaceController.getUserPlaces);

// Protected routes
router.post('/add', auth.verifyUserToken, multer.upload.array('images'), PlaceController.createPlace);
router.put('/:id', auth.verifyUserToken, multer.upload.array('images'), PlaceController.updatePlace);
router.delete('/:id', auth.verifyUserToken, PlaceController.deletePlace);
router.post('/:id/toggle-active', auth.verifyUserToken, PlaceController.toggleActive);

module.exports = router;