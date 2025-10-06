class ValidationHelper {
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePhone(phone) {
    const phoneRegex = /^[0-9+\-\s()]+$/;
    return phoneRegex.test(phone) && phone.length >= 10;
  }

  static validatePassword(password) {
    return password && password.length >= 6;
  }

  static validateRequired(fields, data) {
    const errors = [];
    
    fields.forEach(field => {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        errors.push(`${field} is required`);
      }
    });

    return errors;
  }

  static validateUserRegistration(data) {
    const errors = [];

    // Required fields
    const requiredFields = ['name', 'email', 'phone', 'password', 'city', 'district'];
    const requiredErrors = this.validateRequired(requiredFields, data);
    errors.push(...requiredErrors);

    // Email validation
    if (data.email && !this.validateEmail(data.email)) {
      errors.push('Invalid email format');
    }

    // Phone validation
    if (data.phone && !this.validatePhone(data.phone)) {
      errors.push('Invalid phone number format');
    }

    // Password validation
    if (data.password && !this.validatePassword(data.password)) {
      errors.push('Password must be at least 6 characters long');
    }

    return errors;
  }

  static validatePlaceData(data) {
    const errors = [];

    // Required fields
    const requiredFields = ['title', 'description', 'price', 'location', 'city', 'district', 'category', 'owner_id'];
    const requiredErrors = this.validateRequired(requiredFields, data);
    errors.push(...requiredErrors);

    // Price validation
    if (data.price && (isNaN(data.price) || data.price < 0)) {
      errors.push('Price must be a positive number');
    }

    // Area validation
    if (data.area && (isNaN(data.area) || data.area < 0)) {
      errors.push('Area must be a positive number');
    }

    return errors;
  }

  static validateBookingData(data) {
    const errors = [];

    // Required fields
    const requiredFields = ['user_id', 'place_id', 'owner_id', 'title', 'message', 'phone', 'email'];
    const requiredErrors = this.validateRequired(requiredFields, data);
    errors.push(...requiredErrors);

    // Email validation
    if (data.email && !this.validateEmail(data.email)) {
      errors.push('Invalid email format');
    }

    // Phone validation
    if (data.phone && !this.validatePhone(data.phone)) {
      errors.push('Invalid phone number format');
    }

    return errors;
  }

  static sanitizeString(str) {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/[<>]/g, '');
  }

  static sanitizeObject(obj) {
    const sanitized = {};
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        sanitized[key] = this.sanitizeString(obj[key]);
      } else {
        sanitized[key] = obj[key];
      }
    }
    return sanitized;
  }
}

module.exports = ValidationHelper;