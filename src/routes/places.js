const express = require('express');
const router = express.Router();
const placesController = require('../controllers/placesController');
const { upload } = require('../middleware/upload');

// Places routes
router.get('/', placesController.getPlaces);
router.get('/search', placesController.searchPlaces);
router.get('/by-owner/:ownerId', placesController.getPlacesByOwner);
router.get('/:id', placesController.getPlaceById);

router.post('/add', upload.fields([
  { name: "images", maxCount: 10 },
  { name: "chaletDocument", maxCount: 1 },
  { name: "poolDocument", maxCount: 1 }
]), placesController.addPlace);

router.post('/filter', placesController.filterPlaces);
router.post('/:id/toggle-active', placesController.togglePlaceActive);

router.delete('/:id', placesController.deletePlace);

module.exports = router;