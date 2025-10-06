const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-phone', authController.verifyPhone);
router.post('/reset-password', authController.resetPassword);
router.post('/reset-password-forget', authController.resetPassword);

module.exports = router;