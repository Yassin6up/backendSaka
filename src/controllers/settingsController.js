const db = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

class SettingsController {
  // Update settings
  static updateSettings = asyncHandler(async (req, res) => {
    const { whatsappLink, phoneNumber, commissionValue, limitPosts, appVersion } = req.body;

    const updateFields = [];
    const values = [];

    if (whatsappLink !== undefined) {
      updateFields.push('whatsapp_link = ?');
      values.push(whatsappLink);
    }
    if (phoneNumber !== undefined) {
      updateFields.push('phone_number = ?');
      values.push(phoneNumber);
    }
    if (commissionValue !== undefined) {
      updateFields.push('commission_value = ?');
      values.push(commissionValue);
    }
    if (limitPosts !== undefined) {
      updateFields.push('limit_posts = ?');
      values.push(limitPosts);
    }
    if (appVersion !== undefined) {
      updateFields.push('app_version = ?');
      values.push(appVersion);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No settings to update'
      });
    }

    // Check if settings exist
    const checkQuery = 'SELECT id FROM settings LIMIT 1';
    
    db.query(checkQuery, (error, results) => {
      if (error) {
        console.error('Error checking settings:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      if (results.length === 0) {
        // Create new settings
        const insertQuery = `INSERT INTO settings (${updateFields.join(', ')}, updated_at) VALUES (${updateFields.map(() => '?').join(', ')}, NOW())`;
        db.query(insertQuery, values, (error, result) => {
          if (error) {
            console.error('Error creating settings:', error);
            return res.status(500).json({
              success: false,
              message: 'Database error'
            });
          }

          res.json({
            success: true,
            message: 'Settings created successfully'
          });
        });
      } else {
        // Update existing settings
        values.push(results[0].id);
        const updateQuery = `UPDATE settings SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`;
        
        db.query(updateQuery, values, (error, result) => {
          if (error) {
            console.error('Error updating settings:', error);
            return res.status(500).json({
              success: false,
              message: 'Database error'
            });
          }

          res.json({
            success: true,
            message: 'Settings updated successfully'
          });
        });
      }
    });
  });

  // Get settings
  static getSettings = asyncHandler(async (req, res) => {
    const query = `
      SELECT 
        whatsapp_link, 
        phone_number, 
        commission_value, 
        limit_posts, 
        app_version,
        privacy_ar,
        privacy_en,
        terms_ar,
        terms_en
      FROM settings 
      LIMIT 1
    `;
    
    db.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching settings:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      if (results.length === 0) {
        return res.json({
          success: true,
          settings: {
            whatsapp_link: '',
            phone_number: '',
            commission_value: 0,
            limit_posts: 0,
            app_version: '1.0.0',
            privacy_ar: '',
            privacy_en: '',
            terms_ar: '',
            terms_en: ''
          }
        });
      }

      res.json({
        success: true,
        settings: results[0]
      });
    });
  });

  // Get settings for admin
  static getSettingsAdmin = asyncHandler(async (req, res) => {
    const query = 'SELECT * FROM settings LIMIT 1';
    
    db.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching admin settings:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      if (results.length === 0) {
        return res.json({
          success: true,
          settings: {}
        });
      }

      res.json({
        success: true,
        settings: results[0]
      });
    });
  });

  // Get privacy policy
  static getPrivacy = asyncHandler(async (req, res) => {
    const query = 'SELECT privacy_ar, privacy_en FROM settings LIMIT 1';
    
    db.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching privacy policy:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      if (results.length === 0) {
        return res.json({
          success: true,
          privacy: {
            privacy_ar: 'سياسة الخصوصية غير متوفرة',
            privacy_en: 'Privacy policy not available'
          }
        });
      }

      res.json({
        success: true,
        privacy: results[0]
      });
    });
  });

  // Get terms of service
  static getTerms = asyncHandler(async (req, res) => {
    const query = 'SELECT terms_ar, terms_en FROM settings LIMIT 1';
    
    db.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching terms of service:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      if (results.length === 0) {
        return res.json({
          success: true,
          terms: {
            terms_ar: 'شروط الخدمة غير متوفرة',
            terms_en: 'Terms of service not available'
          }
        });
      }

      res.json({
        success: true,
        terms: results[0]
      });
    });
  });
}

module.exports = SettingsController;