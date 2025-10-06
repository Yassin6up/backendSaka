require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
const moment = require('moment');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import database
const db = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const placesRoutes = require('./routes/places');
const notificationsRoutes = require('./routes/notifications');
const bookingsRoutes = require('./routes/bookings');
const categoriesRoutes = require('./routes/categories');
const reviewsRoutes = require('./routes/reviews');
const likesRoutes = require('./routes/likes');
const followsRoutes = require('./routes/follows');
const reportsRoutes = require('./routes/reports');
const servicesRoutes = require('./routes/services');
const adminRoutes = require('./routes/admin');
const settingsRoutes = require('./routes/settings');
const slidesRoutes = require('./routes/slides');
const subscriptionsRoutes = require('./routes/subscriptions');
const requestsRoutes = require('./routes/requests');
const interestsRoutes = require('./routes/interests');
const userProfileRoutes = require('./routes/userProfile');
const vipRoutes = require('./routes/vip');
const adminActionsRoutes = require('./routes/adminActions');
const adsRoutes = require('./routes/ads');
const userActionsRoutes = require('./routes/userActions');

// Create Express app
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'JBuy Backend Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Server status endpoint
app.get('/server/status', (req, res) => {
  res.json({
    success: true,
    status: 'running',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/likes', likesRoutes);
app.use('/api/follows', followsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/slides', slidesRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/interests', interestsRoutes);
app.use('/api/user-profile', userProfileRoutes);
app.use('/api/vip', vipRoutes);
app.use('/api/admin-actions', adminActionsRoutes);
app.use('/api/ads', adsRoutes);
app.use('/api/user-actions', userActionsRoutes);

// Additional routes that were in the original index.js
app.get('/test/sms', async (req, res) => {
  try {
    const smsService = require('./services/smsService');
    const result = await smsService.sendVerificationCode('966501234567', 'Test SMS from JBuy');
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Additional utility routes
app.get('/api/images/:folderName/:imageName', (req, res) => {
  const { folderName, imageName } = req.params;
  const filePath = path.join(__dirname, '../uploads', folderName, imageName);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({
      success: false,
      message: 'Image not found'
    });
  }
});

// Check user post limit
app.get('/checkUser/:id/limitPosts', (req, res) => {
  const userId = req.params.id;
  const query = 'SELECT limitPosts FROM users WHERE id = ?';
  
  db.query(query, [userId], (error, results) => {
    if (error) {
      console.error('Error checking user limit:', error);
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      limitPosts: results[0].limitPosts || 0
    });
  });
});

// Get user images
app.get('/images/user/:id', (req, res) => {
  const userId = req.params.id;
  const query = 'SELECT images FROM places WHERE owner_id = ?';
  
  db.query(query, [userId], (error, results) => {
    if (error) {
      console.error('Error fetching user images:', error);
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    const images = results.map(place => {
      try {
        return JSON.parse(place.images || '[]');
      } catch (e) {
        return [];
      }
    }).flat();

    res.json({
      success: true,
      images
    });
  });
});

// Check phone number
app.post('/check-phone', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    const normalizedPhone = phoneNumber.replace(/^\+9620/, "+962");
    const query = 'SELECT id FROM users WHERE phone = ?';
    
    db.query(query, [normalizedPhone], (error, results) => {
      if (error) {
        console.error('Error checking phone:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      res.json({
        success: true,
        exists: results.length > 0
      });
    });
  } catch (error) {
    console.error('Check phone error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Reset password for forget
app.post('/reset-password-forget', (req, res) => {
  const { phoneNumber, newPassword } = req.body;
  const normalizedPhone = phoneNumber.replace(/^\+9620/, "+962");
  
  if (!phoneNumber || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Phone number and new password are required'
    });
  }

  const crypto = require('crypto');
  const hashedPassword = crypto.createHash('sha256').update(newPassword).digest('hex');
  
  const query = 'UPDATE users SET password = ? WHERE phone = ?';
  
  db.query(query, [hashedPassword, normalizedPhone], (error, result) => {
    if (error) {
      console.error('Error updating password:', error);
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  });
});

// User phone verification
app.post('/user/phone-verification', (req, res) => {
  const { id, phone } = req.body;
  
  if (!id || !phone) {
    return res.status(400).json({
      success: false,
      message: 'User ID and phone are required'
    });
  }

  const query = 'UPDATE users SET phone = ?, is_verified = 1 WHERE id = ?';
  
  db.query(query, [phone, id], (error, result) => {
    if (error) {
      console.error('Error updating phone:', error);
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    res.json({
      success: true,
      message: 'Phone updated and verified successfully'
    });
  });
});

// Update user phone
app.post('/user/update-phone', (req, res) => {
  const userId = req.body.id;
  const newPhone = req.body.phone;
  
  if (!userId || !newPhone) {
    return res.status(400).json({
      success: false,
      message: 'User ID and phone are required'
    });
  }

  const query = 'UPDATE users SET phone = ? WHERE id = ?';
  
  db.query(query, [newPhone, userId], (error, result) => {
    if (error) {
      console.error('Error updating phone:', error);
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    res.json({
      success: true,
      message: 'Phone updated successfully'
    });
  });
});

// Filter places by city
app.get('/places/filter/city', async (req, res) => {
  try {
    const { longitude, latitude, name } = req.query;
    
    let query = 'SELECT * FROM places WHERE is_active = 1 AND is_approved = 1';
    const params = [];
    
    if (name) {
      query += ' AND city LIKE ?';
      params.push(`%${name}%`);
    }
    
    query += ' ORDER BY created_at DESC';
    
    db.query(query, params, (error, results) => {
      if (error) {
        console.error('Error filtering places by city:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      res.json({
        success: true,
        places: results
      });
    });
  } catch (error) {
    console.error('Filter places by city error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get buy or rent count
app.get('/places/buyOrRent/count', (req, res) => {
  const query = `
    SELECT 
      SUM(CASE WHEN type = 'buy' THEN 1 ELSE 0 END) as buy_count,
      SUM(CASE WHEN type = 'rent' THEN 1 ELSE 0 END) as rent_count
    FROM places 
    WHERE is_active = 1 AND is_approved = 1
  `;
  
  db.query(query, (error, results) => {
    if (error) {
      console.error('Error getting buy/rent count:', error);
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    res.json({
      success: true,
      counts: results[0]
    });
  });
});

// Get places visits
app.get('/places/visits', (req, res) => {
  const query = `
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as visits
    FROM places 
    WHERE is_active = 1 AND is_approved = 1
    GROUP BY DATE(created_at)
    ORDER BY date DESC
    LIMIT 30
  `;
  
  db.query(query, (error, results) => {
    if (error) {
      console.error('Error getting places visits:', error);
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    res.json({
      success: true,
      visits: results
    });
  });
});

// Additional missing routes from original index.js

// Admin filter places
app.get('/admin/filter-places', (req, res) => {
  const {
    address = '',
    category = '',
    priceMin = '',
    priceMax = '',
    status = '',
    page = 1,
    limit = 20
  } = req.query;

  const offset = (page - 1) * limit;
  let query = 'SELECT * FROM places WHERE 1=1';
  const queryParams = [];

  if (address) {
    query += ' AND (city LIKE ? OR district LIKE ? OR address LIKE ?)';
    const addressPattern = `%${address}%`;
    queryParams.push(addressPattern, addressPattern, addressPattern);
  }

  if (category) {
    query += ' AND category = ?';
    queryParams.push(category);
  }

  if (priceMin) {
    query += ' AND price >= ?';
    queryParams.push(parseInt(priceMin));
  }

  if (priceMax) {
    query += ' AND price <= ?';
    queryParams.push(parseInt(priceMax));
  }

  if (status) {
    if (status === 'active') {
      query += ' AND is_active = 1';
    } else if (status === 'inactive') {
      query += ' AND is_active = 0';
    } else if (status === 'approved') {
      query += ' AND is_approved = 1';
    } else if (status === 'pending') {
      query += ' AND is_approved = 0';
    }
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  queryParams.push(parseInt(limit), offset);

  db.query(query, queryParams, (error, results) => {
    if (error) {
      console.error('Error filtering places:', error);
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    res.json({
      success: true,
      places: results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: results.length
      }
    });
  });
});

// Get place for admin
app.get('/admin/places/gat/:id', (req, res) => {
  const placeId = req.params.id;

  const query = `
    SELECT p.*, u.name as owner_name, u.phone as owner_phone, u.email as owner_email
    FROM places p
    LEFT JOIN users u ON p.owner_id = u.id
    WHERE p.id = ?
  `;

  db.query(query, [placeId], (error, results) => {
    if (error) {
      console.error('Error fetching place for admin:', error);
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Place not found'
      });
    }

    const place = results[0];
    if (place.images) {
      place.images = JSON.parse(place.images);
    }

    res.json({
      success: true,
      place
    });
  });
});

// Admin add user
app.post('/api/admin/add-user', async (req, res) => {
  const { name, phone, password } = req.body;

  if (!name || !phone || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, phone, and password are required'
    });
  }

  const crypto = require('crypto');
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

  const query = 'INSERT INTO users (name, phone, password, created_at) VALUES (?, ?, ?, NOW())';

  db.query(query, [name, phone, hashedPassword], (error, result) => {
    if (error) {
      console.error('Error adding user:', error);
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    res.status(201).json({
      success: true,
      message: 'User added successfully',
      userId: result.insertId
    });
  });
});

// Delete places
app.delete('/places/:id', (req, res) => {
  const placeId = req.params.id;

  const query = 'DELETE FROM places WHERE id = ?';

  db.query(query, [placeId], (error, result) => {
    if (error) {
      console.error('Error deleting place:', error);
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Place not found'
      });
    }

    res.json({
      success: true,
      message: 'Place deleted successfully'
    });
  });
});

// Approve place
app.put('/places/:id/approve', (req, res) => {
  const placeId = req.params.id;
  const { adminToken } = req.body;

  if (!adminToken) {
    return res.status(400).json({
      success: false,
      message: 'Admin token is required'
    });
  }

  // Verify admin token
  const adminQuery = 'SELECT id, name FROM admins WHERE token = ? AND is_active = 1';
  
  db.query(adminQuery, [adminToken], (error, adminResults) => {
    if (error) {
      console.error('Error verifying admin:', error);
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    if (adminResults.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin token'
      });
    }

    const admin = adminResults[0];

    // Update place to approved
    const updateQuery = 'UPDATE places SET is_approved = 1, updated_at = NOW() WHERE id = ?';

    db.query(updateQuery, [placeId], (error, result) => {
      if (error) {
        console.error('Error approving place:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Place not found'
        });
      }

      // Log admin action
      const logQuery = `
        INSERT INTO admin_actions_history 
        (admin_id, admin_name, action_type, place_id, action_message, created_at)
        VALUES (?, ?, 'approve', ?, 'Place approved', NOW())
      `;

      db.query(logQuery, [admin.id, admin.name, placeId], (logError) => {
        if (logError) {
          console.error('Error logging admin action:', logError);
        }
      });

      res.json({
        success: true,
        message: 'Place approved successfully'
      });
    });
  });
});

// Delete bookings
app.delete('/bookings/:id', (req, res) => {
  const bookingId = req.params.id;

  const query = 'DELETE FROM bookings WHERE id = ?';

  db.query(query, [bookingId], (error, result) => {
    if (error) {
      console.error('Error deleting booking:', error);
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  });
});

// Admin routes
app.get('/api/admin/getData', (req, res) => {
  // This would typically require admin authentication
  res.json({
    success: true,
    message: 'Admin data endpoint - implement based on requirements'
  });
});

// Search routes
app.get('/search/users', async (req, res) => {
  try {
    const User = require('./models/User');
    const { q, limit = 20, offset = 0 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const users = await User.search(q, parseInt(limit), parseInt(offset));
    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.get('/search/places', async (req, res) => {
  try {
    const Place = require('./models/Place');
    const { q, limit = 20, offset = 0 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const places = await Place.findAll({ search: q }, parseInt(limit), parseInt(offset));
    res.json({
      success: true,
      places
    });
  } catch (error) {
    console.error('Search places error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Privacy and Terms endpoints
app.get('/privacy', (req, res) => {
  res.json({
    success: true,
    message: 'Privacy Policy - Implement based on requirements'
  });
});

app.get('/terms', (req, res) => {
  res.json({
    success: true,
    message: 'Terms of Service - Implement based on requirements'
  });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`🚀 JBuy Backend Server started on port ${port}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${process.env.DB_NAME || 'Not configured'}`);
  console.log(`📧 SMS Service: ${process.env.SMS_USER ? 'Configured' : 'Not configured'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

module.exports = app;