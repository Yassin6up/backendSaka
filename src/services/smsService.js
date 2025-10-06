const fetch = require('node-fetch');
const env = require('../config/env');

async function sendSms({ to, message }) {
  const baseUrl = env.SMS_BASE_URL;
  const url = new URL(baseUrl);
  url.searchParams.set('user', env.SMS_USER);
  url.searchParams.set('pass', env.SMS_PASS);
  url.searchParams.set('sid', env.SMS_SENDER_ID);
  url.searchParams.set('mno', to);
  url.searchParams.set('type', '4');
  url.searchParams.set('text', message);

  const response = await fetch(url.toString());
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`SMS API Error (${response.status}): ${body}`);
  }
  return body;
}

module.exports = { sendSms };
