const db = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

class VipController {
  // Make place VIP
  static makeVip = asyncHandler(async (req, res) => {
    const { placeId, duration, adminToken } = req.body;

    if (!placeId || !duration || !adminToken) {
      return res.status(400).json({
        success: false,
        message: 'Place ID, duration, and admin token are required'
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

      // Calculate VIP expiry date
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + parseInt(duration));

      // Update place to VIP
      const updateQuery = `
        UPDATE places 
        SET is_vip = 1, vip_expires_at = ?, updated_at = NOW() 
        WHERE id = ?
      `;

      db.query(updateQuery, [expiryDate, placeId], (error, result) => {
        if (error) {
          console.error('Error making place VIP:', error);
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
          (admin_id, admin_name, action_type, place_id, action_message)
          VALUES (?, ?, 'make_vip', ?, ?)
        `;

        const actionMessage = `Made place VIP for ${duration} days`;
        
        db.query(logQuery, [admin.id, admin.name, placeId, actionMessage], (logError) => {
          if (logError) {
            console.error('Error logging admin action:', logError);
          }
        });

        res.json({
          success: true,
          message: 'Place made VIP successfully',
          vipExpiresAt: expiryDate
        });
      });
    });
  });

  // Get VIP places
  static getVipPlaces = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const query = `
      SELECT p.*, u.name as owner_name, u.phone as owner_phone
      FROM places p
      LEFT JOIN users u ON p.owner_id = u.id
      WHERE p.is_vip = 1 
      AND p.is_active = 1 
      AND p.is_approved = 1
      AND (p.vip_expires_at IS NULL OR p.vip_expires_at > NOW())
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    db.query(query, [parseInt(limit), offset], (error, results) => {
      if (error) {
        console.error('Error fetching VIP places:', error);
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

  // Check if place is VIP
  static checkVipStatus = asyncHandler(async (req, res) => {
    const { placeId } = req.params;

    const query = `
      SELECT is_vip, vip_expires_at
      FROM places 
      WHERE id = ?
    `;

    db.query(query, [placeId], (error, results) => {
      if (error) {
        console.error('Error checking VIP status:', error);
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
      const isVip = place.is_vip && (!place.vip_expires_at || new Date(place.vip_expires_at) > new Date());

      res.json({
        success: true,
        isVip,
        vipExpiresAt: place.vip_expires_at
      });
    });
  });
}

module.exports = VipController;