// Global error handling middleware

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    success: false,
    message: 'Internal Server Error',
    statusCode: 500
  };

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      success: false,
      message: 'File too large',
      statusCode: 400
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = {
      success: false,
      message: 'Unexpected field',
      statusCode: 400
    };
  }

  // Database errors
  if (err.code === 'ER_DUP_ENTRY') {
    error = {
      success: false,
      message: 'Duplicate entry',
      statusCode: 400
    };
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    error = {
      success: false,
      message: 'Referenced record not found',
      statusCode: 400
    };
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error = {
      success: false,
      message: 'Validation Error',
      errors: err.errors,
      statusCode: 400
    };
  }

  // Custom errors
  if (err.isCustom) {
    error = {
      success: false,
      message: err.message,
      statusCode: err.statusCode || 400
    };
  }

  res.status(error.statusCode).json(error);
};

// 404 handler
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler
};