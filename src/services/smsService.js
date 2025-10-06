const env = require('../config/env');

async function sendVerificationCode(to, message) {
  const baseUrl = env.sms.baseUrl;
  const params = new URLSearchParams({
    user: env.sms.user,
    pass: env.sms.pass,
    sid: env.sms.sid,
    mno: to,
    type: '4',
    text: message,
  });

  const url = `${baseUrl}?${params.toString()}`;
  const response = await fetch(url);
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`SMS API Error (${response.status}): ${body}`);
  }
  return body;
}

module.exports = { sendVerificationCode };
