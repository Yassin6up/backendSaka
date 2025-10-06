const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env if available
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  SMS_BASE_URL: process.env.SMS_BASE_URL || 'http://82.212.81.40:8080/websmpp/websms',
  SMS_USER: process.env.SMS_USER || 'REPLACE_ME',
  SMS_PASS: process.env.SMS_PASS || 'REPLACE_ME',
  SMS_SENDER_ID: process.env.SMS_SENDER_ID || 'Jbuy.App',
};

module.exports = env;
