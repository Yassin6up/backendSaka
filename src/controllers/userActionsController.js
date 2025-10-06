const db = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

class UserActionsController {
  // Block user
  static blockUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { reportId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Update user status to blocked
    const updateQuery = 'UPDATE users SET is_blocked = 1, updated_at = NOW() WHERE id = ?';
    
    db.query(updateQuery, [userId], (error, result) => {
      if (error) {
        console.error('Error blocking user:', error);
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

      // If reportId is provided, update the report status
      if (reportId) {
        const reportQuery = 'UPDATE reports SET status = "resolved" WHERE id = ?';
        
        db.query(reportQuery, [reportId], (reportError) => {
          if (reportError) {
            console.error('Error updating report status:', reportError);
          }
        });
      }

      res.json({
        success: true,
        message: 'User blocked successfully'
      });
    });
  });

  // Unblock user
  static unblockUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const updateQuery = 'UPDATE users SET is_blocked = 0, updated_at = NOW() WHERE id = ?';
    
    db.query(updateQuery, [userId], (error, result) => {
      if (error) {
        console.error('Error unblocking user:', error);
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
        message: 'User unblocked successfully'
      });
    });
  });

  // Stop place
  static stopPlace = asyncHandler(async (req, res) => {
    const { placeId } = req.params;
    const { reportId } = req.body;

    if (!placeId) {
      return res.status(400).json({
        success: false,
        message: 'Place ID is required'
      });
    }

    // Update place status to stopped
    const updateQuery = 'UPDATE places SET is_active = 0, updated_at = NOW() WHERE id = ?';
    
    db.query(updateQuery, [placeId], (error, result) => {
      if (error) {
        console.error('Error stopping place:', error);
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

      // If reportId is provided, update the report status
      if (reportId) {
        const reportQuery = 'UPDATE reports SET status = "resolved" WHERE id = ?';
        
        db.query(reportQuery, [reportId], (reportError) => {
          if (reportError) {
            console.error('Error updating report status:', reportError);
          }
        });
      }

      res.json({
        success: true,
        message: 'Place stopped successfully'
      });
    });
  });

  // Get user action history
  static getUserActionHistory = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        'block' as action_type,
        'User blocked' as action_description,
        updated_at as action_date
      FROM users 
      WHERE id = ? AND is_blocked = 1
      
      UNION ALL
      
      SELECT 
        'unblock' as action_type,
        'User unblocked' as action_description,
        updated_at as action_date
      FROM users 
      WHERE id = ? AND is_blocked = 0
      
      ORDER BY action_date DESC
      LIMIT ? OFFSET ?
    `;

    db.query(query, [userId, userId, parseInt(limit), offset], (error, results) => {
      if (error) {
        console.error('Error fetching user action history:', error);
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
}

module.exports = UserActionsController;