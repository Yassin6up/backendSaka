function getRoot(req, res) {
  res.send('work');
}

function getStatus(req, res) {
  res.json({ message: 'work' });
}

const { sendVerificationCode } = require('../services/smsService');

async function testSms(req, res) {
  try {
    const { to, text } = req.query;
    if (!to || !text) return res.status(400).json({ success: false, message: 'to and text are required' });
    const response = await sendVerificationCode(to, text);
    res.json({ success: true, response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = { getRoot, getStatus, testSms };
