const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Admin routes
router.post('/login', adminController.adminLogin);
router.post('/add-user', adminController.addUser);
router.post('/update-password', adminController.updatePassword);

router.get('/counts', adminController.getDashboardCounts);
router.get('/users', adminController.getAllUsers);
router.get('/places', adminController.getAllPlacesAdmin);
router.get('/admin-actions/:placeId', adminController.getAdminActions);

router.post('/toggle_blocked/:id', adminController.toggleUserBlocked);
router.post('/toggle_trustable/:id', adminController.toggleUserTrustable);

router.delete('/users/:id', adminController.deleteUser);

module.exports = router;