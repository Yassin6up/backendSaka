const https = require('https');

class SMSService {
  constructor() {
    this.baseUrl = process.env.SMS_BASE_URL || 'http://82.212.81.40:8080/websmpp/websms';
    this.user = process.env.SMS_USER || 'JbuyApp1';
    this.pass = process.env.SMS_PASS || '429J@NewY';
    this.sid = process.env.SMS_SID || 'Jbuy.App';
  }

  async sendVerificationCode(to, message) {
    const params = new URLSearchParams({
      user: this.user,
      pass: this.pass,
      sid: this.sid,
      mno: to,
      type: '4', // Unicode for Arabic messages
      text: message
    });

    const url = `${this.baseUrl}?${params.toString()}`;
    
    try {
      const response = await fetch(url);
      const body = await response.text();
      
      if (response.ok) {
        return { success: true, response: body };
      } else {
        throw new Error(`SMS API Error (${response.status}): ${body}`);
      }
    } catch (error) {
      console.error('SMS sending error:', error);
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendWelcomeMessage(phoneNumber, userName) {
    const message = `مرحباً ${userName}! مرحباً بك في تطبيق JBuy. استمتع بتجربة تسوق رائعة!`;
    return await this.sendVerificationCode(phoneNumber, message);
  }

  async sendPasswordResetCode(phoneNumber, code) {
    const message = `رمز إعادة تعيين كلمة المرور: ${code}. لا تشارك هذا الرمز مع أي شخص.`;
    return await this.sendVerificationCode(phoneNumber, message);
  }
}

module.exports = new SMSService();