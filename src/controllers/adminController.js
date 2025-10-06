const db = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

class AdminController {
  // Admin login
  static adminLogin = asyncHandler(async (req, res) => {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Phone and password are required'
      });
    }

    const query = 'SELECT * FROM admins WHERE phone = ? AND password = ? AND is_active = 1';
    
    db.query(query, [phone, password], (error, results) => {
      if (error) {
        console.error('Admin login error:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      if (results.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const admin = results[0];
      res.json({
        success: true,
        message: 'Login successful',
        admin: {
          id: admin.id,
          name: admin.name,
          phone: admin.phone,
          role: admin.role
        }
      });
    });
  });

  // Get admin dashboard data
  static getAdminData = asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Admin token required'
      });
    }

    // Verify admin token
    const adminQuery = 'SELECT id FROM admins WHERE token = ? AND is_active = 1';
    
    db.query(adminQuery, [token], (error, results) => {
      if (error || results.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid admin token'
        });
      }

      // Get dashboard counts
      const countsQuery = `
        SELECT 
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COUNT(*) FROM places) as total_places,
          (SELECT COUNT(*) FROM bookings) as total_bookings,
          (SELECT COUNT(*) FROM reports WHERE status = 'pending') as pending_reports
      `;

      db.query(countsQuery, (error, counts) => {
        if (error) {
          console.error('Error fetching admin data:', error);
          return res.status(500).json({
            success: false,
            message: 'Database error'
          });
        }

        res.json({
          success: true,
          data: counts[0]
        });
      });
    });
  });

  // Get admin counts
  static getAdminCounts = asyncHandler(async (req, res) => {
    const counts = {};

    // Get users count
    const usersQuery = 'SELECT COUNT(*) as count FROM users';
    db.query(usersQuery, (error, results) => {
      if (error) {
        console.error('Error fetching users count:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }
      counts.users = results[0].count;

      // Get places count
      const placesQuery = 'SELECT COUNT(*) as count FROM places';
      db.query(placesQuery, (error, results) => {
        if (error) {
          console.error('Error fetching places count:', error);
          return res.status(500).json({
            success: false,
            message: 'Database error'
          });
        }
        counts.places = results[0].count;

        // Get bookings count
        const bookingsQuery = 'SELECT COUNT(*) as count FROM bookings';
        db.query(bookingsQuery, (error, results) => {
          if (error) {
            console.error('Error fetching bookings count:', error);
            return res.status(500).json({
              success: false,
              message: 'Database error'
            });
          }
          counts.bookings = results[0].count;

          // Get reports count
          const reportsQuery = 'SELECT COUNT(*) as count FROM reports';
          db.query(reportsQuery, (error, results) => {
            if (error) {
              console.error('Error fetching reports count:', error);
              return res.status(500).json({
                success: false,
                message: 'Database error'
              });
            }
            counts.reports = results[0].count;

            res.json({
              success: true,
              counts
            });
          });
        });
      });
    });
  });

  // Get all admins
  static getAllAdmins = asyncHandler(async (req, res) => {
    const query = 'SELECT id, name, phone, role, is_active, created_at FROM admins ORDER BY created_at DESC';
    
    db.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching admins:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      res.json({
        success: true,
        admins: results
      });
    });
  });

  // Create new admin
  static createAdmin = asyncHandler(async (req, res) => {
    const { name, phone, password, role = 'admin' } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone, and password are required'
      });
    }

    const query = 'INSERT INTO admins (name, phone, password, role, is_active, created_at) VALUES (?, ?, ?, ?, 1, NOW())';
    
    db.query(query, [name, phone, password, role], (error, result) => {
      if (error) {
        console.error('Error creating admin:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      res.status(201).json({
        success: true,
        message: 'Admin created successfully',
        admin: {
          id: result.insertId,
          name,
          phone,
          role
        }
      });
    });
  });

  // Delete admin
  static deleteAdmin = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM admins WHERE id = ?';
    
    db.query(query, [id], (error, result) => {
      if (error) {
        console.error('Error deleting admin:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }

      res.json({
        success: true,
        message: 'Admin deleted successfully'
      });
    });
  });

  // Update admin password
  static updateAdminPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, token } = req.body;

    if (!oldPassword || !newPassword || !token) {
      return res.status(400).json({
        success: false,
        message: 'Old password, new password, and token are required'
      });
    }

    // Verify old password
    const verifyQuery = 'SELECT id FROM admins WHERE token = ? AND password = ?';
    
    db.query(verifyQuery, [token, oldPassword], (error, results) => {
      if (error) {
        console.error('Error verifying admin password:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      if (results.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid old password'
        });
      }

      // Update password
      const updateQuery = 'UPDATE admins SET password = ? WHERE token = ?';
      
      db.query(updateQuery, [newPassword, token], (error, result) => {
        if (error) {
          console.error('Error updating admin password:', error);
          return res.status(500).json({
            success: false,
            message: 'Database error'
          });
        }

        res.json({
          success: true,
          message: 'Password updated successfully'
        });
      });
    });
  });

  // Get all users (admin)
  static getAllUsers = asyncHandler(async (req, res) => {
    const query = `
      SELECT 
        id, name, email, phone, profile_picture, is_active, is_verified, created_at,
        (SELECT COUNT(*) FROM places WHERE owner_id = users.id) as places_count,
        (SELECT COUNT(*) FROM bookings WHERE user_id = users.id) as bookings_count
      FROM users 
      ORDER BY created_at DESC
    `;
    
    db.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      res.json({
        success: true,
        users: results
      });
    });
  });

  // Update user
  static updateUser = asyncHandler(async (req, res) => {
    const { name, phone, password, userId, limitPosts, description } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const updateFields = [];
    const values = [];

    if (name) {
      updateFields.push('name = ?');
      values.push(name);
    }
    if (phone) {
      updateFields.push('phone = ?');
      values.push(phone);
    }
    if (password) {
      updateFields.push('password = ?');
      values.push(password);
    }
    if (limitPosts !== undefined) {
      updateFields.push('limitPosts = ?');
      values.push(limitPosts);
    }
    if (description) {
      updateFields.push('description = ?');
      values.push(description);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(userId);
    const query = `UPDATE users SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`;
    
    db.query(query, values, (error, result) => {
      if (error) {
        console.error('Error updating user:', error);
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
        message: 'User updated successfully'
      });
    });
  });

  // Delete user
  static deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM users WHERE id = ?';
    
    db.query(query, [id], (error, result) => {
      if (error) {
        console.error('Error deleting user:', error);
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
        message: 'User deleted successfully'
      });
    });
  });
}

module.exports = AdminController;