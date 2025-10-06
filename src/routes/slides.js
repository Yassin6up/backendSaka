const express = require('express');
const router = express.Router();
const SlidesController = require('../controllers/slidesController');
const { authenticateAdmin } = require('../middleware/auth');
const { upload } = require('../config/upload');

// Public routes
router.get('/api/slides', SlidesController.getAllSlides);
router.get('/api/slides/single/:fileName', SlidesController.getSlide);
router.get('/api/icons/single/:fileName', SlidesController.getIcon);

// Admin routes
router.post('/api/slides', authenticateAdmin, upload.single('slide'), SlidesController.createSlide);
router.delete('/api/slides/:fileName', authenticateAdmin, SlidesController.deleteSlide);

module.exports = router;