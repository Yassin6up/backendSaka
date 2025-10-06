const express = require('express');
const router = express.Router();
const SettingsController = require('../controllers/settingsController');
const { authenticateAdmin } = require('../middleware/auth');

// Public routes
router.get('/get-settings', SettingsController.getSettings);
router.get('/privacy', SettingsController.getPrivacy);
router.get('/terms', SettingsController.getTerms);

// Admin routes
router.post('/update-settings', authenticateAdmin, SettingsController.updateSettings);
router.get('/get-settings-admin', authenticateAdmin, SettingsController.getSettingsAdmin);

module.exports = router;