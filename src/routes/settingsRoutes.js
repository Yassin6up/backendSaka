const express = require('express');
const { getSubscriptions } = require('../controllers/settingsController');
const router = express.Router();

router.get('/api/subscriptions', getSubscriptions);

module.exports = router;
