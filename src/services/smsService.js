const config = require('../config/app');

class SMSService {
  static async sendVerificationCode(to, message) {
    const params = new URLSearchParams({
      user: config.sms.user,
      pass: config.sms.pass,
      sid: config.sms.sid,
      mno: to,
      type: config.sms.type,
      text: message
    });

    const url = `${config.sms.baseUrl}?${params.toString()}`;
    
    try {
      const response = await fetch(url);
      const body = await response.text();
      
      if (response.ok) {
        return body;
      } else {
        throw new Error(`SMS API Error (${response.status}): ${body}`);
      }
    } catch (error) {
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  static async sendSMS(to, message) {
    return this.sendVerificationCode(to, message);
  }
}

module.exports = SMSService;