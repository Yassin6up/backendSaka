const { ResponseHelper, ValidationHelper } = require('../utils');
const { NotificationService } = require('../services');
const db = require('../config/database');

class AdminController {
  static async getDashboardData(req, res) {
    try {
      const queries = {
        totalUsers: 'SELECT COUNT(*) as count FROM users',
        totalPlaces: 'SELECT COUNT(*) as count FROM places',
        totalBookings: 'SELECT COUNT(*) as count FROM bookings',
        pendingPlaces: 'SELECT COUNT(*) as count FROM places WHERE is_active = 0',
        pendingBookings: 'SELECT COUNT(*) as count FROM bookings WHERE status = "pending"'
      };

      const results = {};

      for (const [key, query] of Object.entries(queries)) {
        await new Promise((resolve, reject) => {
          db.query(query, (err, result) => {
            if (err) {
              reject(err);
            } else {
              results[key] = result[0].count;
              resolve();
            }
          });
        });
      }

      return ResponseHelper.success(res, results, 'Dashboard data retrieved successfully');

    } catch (error) {
      console.error('Get dashboard data error:', error);
      return ResponseHelper.error(res, 'Failed to retrieve dashboard data', 500, error);
    }
  }

  static async getAllPlaces(req, res) {
    try {
      const query = `
        SELECT p.*, u.name as owner_name, u.phone as owner_phone
        FROM places p
        LEFT JOIN users u ON p.owner_id = u.id
        ORDER BY p.created_at DESC
      `;

      db.query(query, (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return ResponseHelper.error(res, 'Database error', 500);
        }

        return ResponseHelper.success(res, results, 'All places retrieved successfully');
      });

    } catch (error) {
      console.error('Get all places error:', error);
      return ResponseHelper.error(res, 'Failed to retrieve places', 500, error);
    }
  }

  static async getAllUsers(req, res) {
    try {
      const query = `
        SELECT id, name, email, phone, city, district, created_at, last_login
        FROM users
        ORDER BY created_at DESC
      `;

      db.query(query, (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return ResponseHelper.error(res, 'Database error', 500);
        }

        return ResponseHelper.success(res, results, 'All users retrieved successfully');
      });

    } catch (error) {
      console.error('Get all users error:', error);
      return ResponseHelper.error(res, 'Failed to retrieve users', 500, error);
    }
  }

  static async approvePlace(req, res) {
    try {
      const { id } = req.params;
      const { adminToken, actionMessage } = req.body;

      if (!adminToken || !actionMessage) {
        return ResponseHelper.validationError(res, 'Admin token and action message are required');
      }

      // Update place status
      const updateQuery = 'UPDATE places SET is_active = 1 WHERE id = ?';
      db.query(updateQuery, [id], (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return ResponseHelper.error(res, 'Database error', 500);
        }

        if (result.affectedRows === 0) {
          return ResponseHelper.notFound(res, 'Place not found');
        }

        // Log admin action
        NotificationService.logAdminAction({
          adminToken,
          actionType: 'approve_place',
          placeId: id,
          actionMessage
        }, (logErr, logResult) => {
          if (logErr) {
            console.error('Log admin action error:', logErr);
            return ResponseHelper.error(res, 'Failed to log admin action', 500);
          }

          return ResponseHelper.success(res, null, 'Place approved successfully');
        });
      });

    } catch (error) {
      console.error('Approve place error:', error);
      return ResponseHelper.error(res, 'Failed to approve place', 500, error);
    }
  }

  static async rejectPlace(req, res) {
    try {
      const { id } = req.params;
      const { adminToken, actionMessage } = req.body;

      if (!adminToken || !actionMessage) {
        return ResponseHelper.validationError(res, 'Admin token and action message are required');
      }

      // Update place status
      const updateQuery = 'UPDATE places SET is_active = 0 WHERE id = ?';
      db.query(updateQuery, [id], (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return ResponseHelper.error(res, 'Database error', 500);
        }

        if (result.affectedRows === 0) {
          return ResponseHelper.notFound(res, 'Place not found');
        }

        // Log admin action
        NotificationService.logAdminAction({
          adminToken,
          actionType: 'reject_place',
          placeId: id,
          actionMessage
        }, (logErr, logResult) => {
          if (logErr) {
            console.error('Log admin action error:', logErr);
            return ResponseHelper.error(res, 'Failed to log admin action', 500);
          }

          return ResponseHelper.success(res, null, 'Place rejected successfully');
        });
      });

    } catch (error) {
      console.error('Reject place error:', error);
      return ResponseHelper.error(res, 'Failed to reject place', 500, error);
    }
  }

  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const query = 'DELETE FROM users WHERE id = ?';
      db.query(query, [id], (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return ResponseHelper.error(res, 'Database error', 500);
        }

        if (result.affectedRows === 0) {
          return ResponseHelper.notFound(res, 'User not found');
        }

        return ResponseHelper.success(res, null, 'User deleted successfully');
      });

    } catch (error) {
      console.error('Delete user error:', error);
      return ResponseHelper.error(res, 'Failed to delete user', 500, error);
    }
  }

  static async blockUser(req, res) {
    try {
      const { userId } = req.params;
      const { isBlocked } = req.body;

      const query = 'UPDATE users SET is_blocked = ? WHERE id = ?';
      db.query(query, [isBlocked ? 1 : 0, userId], (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return ResponseHelper.error(res, 'Database error', 500);
        }

        if (result.affectedRows === 0) {
          return ResponseHelper.notFound(res, 'User not found');
        }

        return ResponseHelper.success(res, null, `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`);
      });

    } catch (error) {
      console.error('Block user error:', error);
      return ResponseHelper.error(res, 'Failed to update user status', 500, error);
    }
  }

  static async getReports(req, res) {
    try {
      const query = `
        SELECT r.*, u.name as reporter_name, p.title as place_title
        FROM reports r
        LEFT JOIN users u ON r.reporter_id = u.id
        LEFT JOIN places p ON r.place_id = p.id
        ORDER BY r.created_at DESC
      `;

      db.query(query, (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return ResponseHelper.error(res, 'Database error', 500);
        }

        return ResponseHelper.success(res, results, 'Reports retrieved successfully');
      });

    } catch (error) {
      console.error('Get reports error:', error);
      return ResponseHelper.error(res, 'Failed to retrieve reports', 500, error);
    }
  }

  static async updateReportStatus(req, res) {
    try {
      const { reportId } = req.params;
      const { status } = req.body;

      if (!status) {
        return ResponseHelper.validationError(res, 'Status is required');
      }

      const query = 'UPDATE reports SET status = ? WHERE id = ?';
      db.query(query, [status, reportId], (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return ResponseHelper.error(res, 'Database error', 500);
        }

        if (result.affectedRows === 0) {
          return ResponseHelper.notFound(res, 'Report not found');
        }

        return ResponseHelper.success(res, null, 'Report status updated successfully');
      });

    } catch (error) {
      console.error('Update report status error:', error);
      return ResponseHelper.error(res, 'Failed to update report status', 500, error);
    }
  }
}

module.exports = AdminController;