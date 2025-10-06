const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const generateUUID = () => {
  return uuidv4();
};

const generateRandomCode = (length = 6) => {
  return Math.floor(Math.random() * Math.pow(10, length)).toString().padStart(length, '0');
};

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10,15}$/;
  return phoneRegex.test(phone);
};

const formatResponse = (success, message, data = null) => {
  return {
    success,
    message,
    data
  };
};

module.exports = {
  generateUUID,
  generateRandomCode,
  hashPassword,
  validateEmail,
  validatePhone,
  formatResponse
};