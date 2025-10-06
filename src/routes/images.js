const express = require('express');
const router = express.Router();
const placesController = require('../controllers/placesController');

// Image serving routes
router.get('/:folderName/:imageName', placesController.getPlaceImage);

module.exports = router;