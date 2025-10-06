const express = require('express');
const router = express.Router();
const UserActionsController = require('../controllers/userActionsController');
const { authenticateAdmin } = require('../middleware/auth');

// Block user
router.put('/users/action/:userId/block', authenticateAdmin, UserActionsController.blockUser);

// Unblock user
router.put('/users/action/:userId/unblock', authenticateAdmin, UserActionsController.unblockUser);

// Stop place
router.put('/places/:placeId/stop', authenticateAdmin, UserActionsController.stopPlace);

// Get user action history
router.get('/users/:userId/actions', authenticateAdmin, UserActionsController.getUserActionHistory);

module.exports = router;