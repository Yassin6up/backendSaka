const express = require('express');
const router = express.Router();
const { AuthController } = require('../controllers');
const { auth } = require('../middleware');

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/verify-phone', AuthController.verifyPhone);
router.post('/send-verification-code', AuthController.sendVerificationCode);
router.post('/reset-password', AuthController.resetPassword);

// Protected routes
router.post('/update-profile', auth.verifyUserToken, AuthController.updateProfile);

module.exports = router;