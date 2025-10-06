const db = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

class SubscriptionsController {
  // Get all subscriptions
  static getAllSubscriptions = asyncHandler(async (req, res) => {
    const query = 'SELECT * FROM subscriptions ORDER BY created_at DESC';
    
    db.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching subscriptions:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      res.json({
        success: true,
        subscriptions: results
      });
    });
  });

  // Create subscription
  static createSubscription = asyncHandler(async (req, res) => {
    const { name, price, duration, features, is_active = 1 } = req.body;

    if (!name || !price || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, and duration are required'
      });
    }

    const query = 'INSERT INTO subscriptions (name, price, duration, features, is_active, created_at) VALUES (?, ?, ?, ?, ?, NOW())';
    
    db.query(query, [name, price, duration, JSON.stringify(features || []), is_active], (error, result) => {
      if (error) {
        console.error('Error creating subscription:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      res.status(201).json({
        success: true,
        message: 'Subscription created successfully',
        subscription: {
          id: result.insertId,
          name,
          price,
          duration,
          features,
          is_active
        }
      });
    });
  });

  // Update subscription
  static updateSubscription = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, price, duration, features, is_active } = req.body;

    const updateFields = [];
    const values = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      values.push(name);
    }
    if (price !== undefined) {
      updateFields.push('price = ?');
      values.push(price);
    }
    if (duration !== undefined) {
      updateFields.push('duration = ?');
      values.push(duration);
    }
    if (features !== undefined) {
      updateFields.push('features = ?');
      values.push(JSON.stringify(features));
    }
    if (is_active !== undefined) {
      updateFields.push('is_active = ?');
      values.push(is_active);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(id);
    const query = `UPDATE subscriptions SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`;
    
    db.query(query, values, (error, result) => {
      if (error) {
        console.error('Error updating subscription:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Subscription not found'
        });
      }

      res.json({
        success: true,
        message: 'Subscription updated successfully'
      });
    });
  });

  // Delete subscription
  static deleteSubscription = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM subscriptions WHERE id = ?';
    
    db.query(query, [id], (error, result) => {
      if (error) {
        console.error('Error deleting subscription:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Subscription not found'
        });
      }

      res.json({
        success: true,
        message: 'Subscription deleted successfully'
      });
    });
  });
}

module.exports = SubscriptionsController;