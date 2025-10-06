const db = require('../config/database');

// Simple authentication middleware (you can enhance this with JWT if needed)
const authenticateUser = (req, res, next) => {
  const userId = req.headers['user-id'] || req.body.userId || req.params.userId;
  
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User ID is required for authentication'
    });
  }

  // Verify user exists
  const query = 'SELECT id, name, email, phone, is_active FROM users WHERE id = ?';
  
  db.query(query, [userId], (error, results) => {
    if (error) {
      console.error('Database error in auth middleware:', error);
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = results[0];
    
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    req.user = user;
    next();
  });
};

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
  const adminId = req.headers['admin-id'] || req.body.adminId;
  
  if (!adminId) {
    return res.status(401).json({
      success: false,
      message: 'Admin ID is required'
    });
  }

  const query = 'SELECT id, name, email, role FROM admins WHERE id = ? AND is_active = 1';
  
  db.query(query, [adminId], (error, results) => {
    if (error) {
      console.error('Database error in admin auth middleware:', error);
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found or inactive'
      });
    }

    req.admin = results[0];
    next();
  });
};

// Optional authentication (doesn't fail if no user)
const optionalAuth = (req, res, next) => {
  const userId = req.headers['user-id'] || req.body.userId || req.params.userId;
  
  if (!userId) {
    req.user = null;
    return next();
  }

  const query = 'SELECT id, name, email, phone, is_active FROM users WHERE id = ?';
  
  db.query(query, [userId], (error, results) => {
    if (error || results.length === 0) {
      req.user = null;
    } else {
      req.user = results[0];
    }
    next();
  });
};

module.exports = {
  authenticateUser,
  authenticateAdmin,
  optionalAuth
};