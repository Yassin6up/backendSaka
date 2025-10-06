const express = require('express');
const path = require('path');
const { sendSms } = require('../services/smsService');

const router = express.Router();

router.get('/', (req, res) => res.send('work'));
router.get('/server/status', (req, res) => res.json({ message: 'work' }));

// Static mounts will be set in app.js; keep here if needed
router.get('/health', (req, res) => res.json({ ok: true }));

// Test SMS endpoint (legacy /test/sms)
router.get('/test/sms', async (req, res, next) => {
  try {
    const response = await sendSms({ to: '+962782950000', message: 'This is a test message!' });
    res.json({ success: true, response });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
