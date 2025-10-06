const express = require('express');
const { searchUsers, searchPlaces, searchPlacesByTitle } = require('../controllers/searchController');
const router = express.Router();

router.get('/search/users', searchUsers);
router.get('/search/places', searchPlaces);
router.get('/api/search/places', searchPlacesByTitle);

module.exports = router;
