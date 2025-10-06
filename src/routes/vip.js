const express = require('express');
const router = express.Router();
const VipController = require('../controllers/vipController');
const { authenticateAdmin } = require('../middleware/auth');

// Make place VIP (admin only)
router.post('/api/make-vip', authenticateAdmin, VipController.makeVip);

// Get VIP places
router.get('/api/vip-places', VipController.getVipPlaces);

// Check VIP status
router.get('/api/places/:placeId/vip-status', VipController.checkVipStatus);

module.exports = router;