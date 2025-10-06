// Validation middleware functions

const validatePhoneNumber = (phone) => {
  // Basic phone number validation for Arabic numbers
  const phoneRegex = /^(\+966|966|0)?[5-9][0-9]{8}$/;
  return phoneRegex.test(phone);
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // At least 6 characters
  return password && password.length >= 6;
};

// Middleware to validate user registration
const validateRegistration = (req, res, next) => {
  const { name, email, phone, password } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!email || !validateEmail(email)) {
    errors.push('Valid email is required');
  }

  if (!phone || !validatePhoneNumber(phone)) {
    errors.push('Valid phone number is required');
  }

  if (!password || !validatePassword(password)) {
    errors.push('Password must be at least 6 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Middleware to validate login
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !validateEmail(email)) {
    errors.push('Valid email is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Middleware to validate phone verification
const validatePhoneVerification = (req, res, next) => {
  const { phone, code } = req.body;
  const errors = [];

  if (!phone || !validatePhoneNumber(phone)) {
    errors.push('Valid phone number is required');
  }

  if (!code || code.length !== 6) {
    errors.push('Verification code must be 6 digits');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Middleware to validate place creation
const validatePlaceCreation = (req, res, next) => {
  const { title, description, price, category, city, district } = req.body;
  const errors = [];

  if (!title || title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long');
  }

  if (!description || description.trim().length < 10) {
    errors.push('Description must be at least 10 characters long');
  }

  if (!price || isNaN(price) || price <= 0) {
    errors.push('Valid price is required');
  }

  if (!category) {
    errors.push('Category is required');
  }

  if (!city) {
    errors.push('City is required');
  }

  if (!district) {
    errors.push('District is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Middleware to validate booking
const validateBooking = (req, res, next) => {
  const { place_id, user_id, booking_date, message } = req.body;
  const errors = [];

  if (!place_id) {
    errors.push('Place ID is required');
  }

  if (!user_id) {
    errors.push('User ID is required');
  }

  if (!booking_date) {
    errors.push('Booking date is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

module.exports = {
  validatePhoneNumber,
  validateEmail,
  validatePassword,
  validateRegistration,
  validateLogin,
  validatePhoneVerification,
  validatePlaceCreation,
  validateBooking
};