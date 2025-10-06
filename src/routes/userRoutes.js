const express = require('express');
const { toggleBlocked, toggleTrustable, blockedStatus } = require('../controllers/userController');
const router = express.Router();

router.post('/toggle_blocked/:id', toggleBlocked);
router.post('/toggle_trustable/:id', toggleTrustable);
router.get('/user/blocked-status/:userId', blockedStatus);

module.exports = router;
