const express = require('express');
const { updatePicture, serveProfileImage, getUserImageName, profileUpload } = require('../controllers/profileController');
const router = express.Router();

router.post('/update-picture/user', profileUpload.single('imageFile'), updatePicture);
router.get('/user/profile-picture/:imageName', serveProfileImage);
router.get('/images/user/:id', getUserImageName);

module.exports = router;
