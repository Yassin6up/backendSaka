const { SMS_CONFIG } = require('../config/constants');

const sendVerificationCode = async (to, message) => {
  const baseUrl = SMS_CONFIG.BASE_URL;
  const params = new URLSearchParams({
    user: SMS_CONFIG.USER,
    pass: SMS_CONFIG.PASS,
    sid: SMS_CONFIG.SID,
    mno: to,
    type: SMS_CONFIG.TYPE,
    text: message
  });

  const url = `${baseUrl}?${params.toString()}`;
  
  try {
    const response = await fetch(url);
    const body = await response.text();
    
    if (response.ok) {
      return body;
    } else {
      throw new Error(`SMS API Error (${response.status}): ${body}`);
    }
  } catch (error) {
    throw new Error(`Failed to send SMS: ${error}`);
  }
};

module.exports = {
  sendVerificationCode
};