const express = require('express');
const { register, login, verifyPhone, checkPhone, resetPasswordForget } = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-phone', verifyPhone);
router.post('/check-phone', checkPhone);
router.post('/reset-password-forget', resetPasswordForget);

module.exports = router;
