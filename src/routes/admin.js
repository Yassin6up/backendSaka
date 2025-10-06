const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { authenticateAdmin } = require('../middleware/auth');

// Public admin routes
router.post('/api/admin/login', AdminController.adminLogin);

// Protected admin routes
router.get('/api/admin/getData', authenticateAdmin, AdminController.getAdminData);
router.get('/admin/counts', authenticateAdmin, AdminController.getAdminCounts);
router.get('/admins', authenticateAdmin, AdminController.getAllAdmins);
router.post('/admins', authenticateAdmin, AdminController.createAdmin);
router.delete('/admins/:id', authenticateAdmin, AdminController.deleteAdmin);
router.post('/admin/update-password', authenticateAdmin, AdminController.updateAdminPassword);

// User management
router.get('/admin/users', authenticateAdmin, AdminController.getAllUsers);
router.put('/api/users/update', authenticateAdmin, AdminController.updateUser);
router.post('/admin/delete/users/:id', authenticateAdmin, AdminController.deleteUser);

module.exports = router;