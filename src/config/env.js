require('dotenv').config();

const env = {
  port: process.env.PORT || 5000,
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },
  sms: {
    baseUrl: process.env.SMS_BASE_URL || 'http://82.212.81.40:8080/websmpp/websms',
    user: process.env.SMS_USER,
    pass: process.env.SMS_PASS,
    sid: process.env.SMS_SENDER_ID,
  },
};

module.exports = env;
