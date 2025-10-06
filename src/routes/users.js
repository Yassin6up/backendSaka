const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { uploadProfile } = require('../middleware/upload');

// User routes
router.get('/search', userController.searchUsers);
router.get('/profile-picture/:imageName', userController.getProfilePicture);
router.get('/:userId', userController.getUserProfile);
router.get('/checkUser/:id/limitPosts', userController.checkUserLimitPosts);

router.post('/update-user', userController.updateUser);
router.post('/update-picture/user', uploadProfile.single('imageFile'), userController.updateProfilePicture);
router.post('/follow/user', userController.followUser);

module.exports = router;