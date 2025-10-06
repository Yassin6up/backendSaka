const express = require('express');
const router = express.Router();
const ReportsController = require('../controllers/reportsController');
const { authenticateUser, authenticateAdmin } = require('../middleware/auth');

// Create report (requires authentication)
router.post('/api/report', authenticateUser, ReportsController.createReport);

// Get all reports (admin only)
router.get('/api/reports', authenticateAdmin, ReportsController.getAllReports);

// Get report by ID (admin only)
router.get('/api/reports/:reportId', authenticateAdmin, ReportsController.getReportById);

// Update report status (admin only)
router.put('/reports/:reportId/status', authenticateAdmin, ReportsController.updateReportStatus);

// Get user's reports
router.get('/user/:userId/reports', authenticateUser, ReportsController.getUserReports);

// Delete report (admin only)
router.delete('/reports/:reportId', authenticateAdmin, ReportsController.deleteReport);

module.exports = router;