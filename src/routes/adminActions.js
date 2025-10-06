const express = require('express');
const router = express.Router();
const AdminActionsController = require('../controllers/adminActionsController');
const { authenticateAdmin } = require('../middleware/auth');

// Get admin actions for a place
router.get('/api/admin-actions/:placeId', authenticateAdmin, AdminActionsController.getAdminActions);

// Log admin action
router.post('/api/admin-actions', authenticateAdmin, AdminActionsController.logAdminAction);

// Get all admin actions
router.get('/api/admin-actions', authenticateAdmin, AdminActionsController.getAllAdminActions);

// Delete admin action
router.delete('/api/admin-actions/:actionId', authenticateAdmin, AdminActionsController.deleteAdminAction);

module.exports = router;