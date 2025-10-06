const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { validateRegistration, validateLogin, validatePhoneVerification } = require('../middleware/validation');
const { authenticateUser } = require('../middleware/auth');
const { uploadProfile } = require('../config/upload');

// Public routes
router.post('/register', validateRegistration, AuthController.register);
router.post('/login', validateLogin, AuthController.login);
router.post('/verify-phone', validatePhoneVerification, AuthController.verifyPhone);
router.post('/reset-password', AuthController.resetPassword);
router.post('/reset-password-forget', AuthController.updatePassword);

// Protected routes
router.get('/profile/:userId', AuthController.getProfile);
router.post('/user/update-user', authenticateUser, AuthController.updateProfile);
router.post('/user/update-name', authenticateUser, AuthController.updateProfile);
router.post('/user/phone-verification', authenticateUser, AuthController.verifyPhone);
router.post('/user/update-phone', authenticateUser, AuthController.updateProfile);

// Profile picture upload
router.post('/update-picture/user', uploadProfile.single('imageFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No image file provided'
    });
  }

  res.json({
    success: true,
    message: 'Profile picture updated successfully',
    imagePath: `/uploads/profile/${req.file.filename}`
  });
});

// Get profile picture
router.get('/user/profile-picture/:imageName', (req, res) => {
  const { imageName } = req.params;
  const imagePath = path.join(__dirname, '../../uploads/profile', imageName);
  
  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    res.status(404).json({
      success: false,
      message: 'Image not found'
    });
  }
});

module.exports = router;