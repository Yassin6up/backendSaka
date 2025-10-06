const db = require('../config/database');

// Middleware to verify admin token
const verifyAdminToken = (req, res, next) => {
  const adminToken = req.headers.authorization || req.body.adminToken;
  
  if (!adminToken) {
    return res.status(401).json({ 
      success: false, 
      message: 'Admin token required' 
    });
  }

  const query = 'SELECT id, name FROM admins WHERE token = ?';
  db.query(query, [adminToken], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Database error' 
      });
    }

    if (results.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid admin token' 
      });
    }

    req.admin = results[0];
    next();
  });
};

// Middleware to verify user token
const verifyUserToken = (req, res, next) => {
  const userToken = req.headers.authorization || req.body.userToken;
  
  if (!userToken) {
    return res.status(401).json({ 
      success: false, 
      message: 'User token required' 
    });
  }

  const query = 'SELECT id, name, email FROM users WHERE token = ?';
  db.query(query, [userToken], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Database error' 
      });
    }

    if (results.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid user token' 
      });
    }

    req.user = results[0];
    next();
  });
};

module.exports = {
  verifyAdminToken,
  verifyUserToken
};