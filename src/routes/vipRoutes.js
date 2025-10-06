const express = require('express');
const { makeVip } = require('../controllers/vipController');
const router = express.Router();

router.post('/api/make-vip', makeVip);

module.exports = router;
