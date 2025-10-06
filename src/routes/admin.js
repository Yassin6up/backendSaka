const express = require('express');
const router = express.Router();
const { AdminController } = require('../controllers');
const { auth } = require('../middleware');

// Admin protected routes
router.get('/dashboard', auth.verifyAdminToken, AdminController.getDashboardData);
router.get('/places', auth.verifyAdminToken, AdminController.getAllPlaces);
router.get('/users', auth.verifyAdminToken, AdminController.getAllUsers);
router.get('/reports', auth.verifyAdminToken, AdminController.getReports);
router.post('/places/:id/approve', auth.verifyAdminToken, AdminController.approvePlace);
router.post('/places/:id/reject', auth.verifyAdminToken, AdminController.rejectPlace);
router.delete('/users/:id', auth.verifyAdminToken, AdminController.deleteUser);
router.put('/users/:userId/block', auth.verifyAdminToken, AdminController.blockUser);
router.put('/reports/:reportId/status', auth.verifyAdminToken, AdminController.updateReportStatus);

module.exports = router;