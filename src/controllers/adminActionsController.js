const db = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

class AdminActionsController {
  // Get admin actions for a place
  static getAdminActions = asyncHandler(async (req, res) => {
    const { placeId } = req.params;

    const query = `
      SELECT 
        aah.id,
        aah.admin_id,
        aah.admin_name,
        aah.action_type,
        aah.place_id,
        aah.action_message,
        aah.created_at,
        p.title as place_title
      FROM admin_actions_history aah
      LEFT JOIN places p ON aah.place_id = p.id
      WHERE aah.place_id = ?
      ORDER BY aah.created_at DESC
    `;

    db.query(query, [placeId], (error, results) => {
      if (error) {
        console.error('Error fetching admin actions:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      res.json({
        success: true,
        actions: results
      });
    });
  });

  // Log admin action
  static logAdminAction = asyncHandler(async (req, res) => {
    const { adminToken, actionType, placeId, actionMessage } = req.body;

    if (!adminToken || !actionType || !placeId || !actionMessage) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Fetch admin details using the adminToken
    const fetchAdminQuery = 'SELECT id, name FROM admins WHERE token = ?';
    
    db.query(fetchAdminQuery, [adminToken], (fetchErr, fetchResults) => {
      if (fetchErr) {
        console.error('Database error (fetch admin):', fetchErr);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch admin details'
        });
      }

      if (fetchResults.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Admin not found'
        });
      }

      const admin = fetchResults[0];
      const adminId = admin.id;
      const adminName = admin.name;

      // Insert the admin action into the history table
      const insertQuery = `
        INSERT INTO admin_actions_history 
        (admin_id, admin_name, action_type, place_id, action_message, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;

      const values = [adminId, adminName, actionType, placeId, actionMessage];

      db.query(insertQuery, values, (insertErr, insertResults) => {
        if (insertErr) {
          console.error('Database error (insert action):', insertErr);
          return res.status(500).json({
            success: false,
            message: 'Failed to log admin action'
          });
        }

        res.json({
          success: true,
          message: 'Admin action logged successfully',
          actionId: insertResults.insertId
        });
      });
    });
  });

  // Get all admin actions
  static getAllAdminActions = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, adminId, actionType } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        aah.id,
        aah.admin_id,
        aah.admin_name,
        aah.action_type,
        aah.place_id,
        aah.action_message,
        aah.created_at,
        p.title as place_title
      FROM admin_actions_history aah
      LEFT JOIN places p ON aah.place_id = p.id
      WHERE 1=1
    `;

    const queryParams = [];

    if (adminId) {
      query += ' AND aah.admin_id = ?';
      queryParams.push(adminId);
    }

    if (actionType) {
      query += ' AND aah.action_type = ?';
      queryParams.push(actionType);
    }

    query += ' ORDER BY aah.created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);

    db.query(query, queryParams, (error, results) => {
      if (error) {
        console.error('Error fetching admin actions:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      res.json({
        success: true,
        actions: results,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: results.length
        }
      });
    });
  });

  // Delete admin action
  static deleteAdminAction = asyncHandler(async (req, res) => {
    const { actionId } = req.params;

    const query = 'DELETE FROM admin_actions_history WHERE id = ?';

    db.query(query, [actionId], (error, result) => {
      if (error) {
        console.error('Error deleting admin action:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Admin action not found'
        });
      }

      res.json({
        success: true,
        message: 'Admin action deleted successfully'
      });
    });
  });
}

module.exports = AdminActionsController;