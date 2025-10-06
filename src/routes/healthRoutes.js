const express = require('express');
const { getRoot, getStatus, testSms } = require('../controllers/healthController');
const router = express.Router();

router.get('/', getRoot);
router.get('/server/status', getStatus);
router.get('/test/sms', testSms);

module.exports = router;
