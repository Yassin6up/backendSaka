const db = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

class AdsController {
  // Update ads
  static updateAds = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const files = req.files;
    const {
      title,
      description,
      price,
      category,
      city,
      district,
      owner_id,
      is_active = 1
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Ad ID is required'
      });
    }

    // Check if ad exists
    const checkQuery = 'SELECT id FROM places WHERE id = ?';
    
    db.query(checkQuery, [id], (error, results) => {
      if (error) {
        console.error('Error checking ad:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Ad not found'
        });
      }

      // Prepare update data
      const updateFields = [];
      const values = [];

      if (title) {
        updateFields.push('title = ?');
        values.push(title);
      }
      if (description) {
        updateFields.push('description = ?');
        values.push(description);
      }
      if (price) {
        updateFields.push('price = ?');
        values.push(price);
      }
      if (category) {
        updateFields.push('category = ?');
        values.push(category);
      }
      if (city) {
        updateFields.push('city = ?');
        values.push(city);
      }
      if (district) {
        updateFields.push('district = ?');
        values.push(district);
      }
      if (is_active !== undefined) {
        updateFields.push('is_active = ?');
        values.push(is_active);
      }

      // Handle new photos
      if (files && files.length > 0) {
        const newPhotos = files.map(file => `/uploads/places/${file.filename}`);
        updateFields.push('images = ?');
        values.push(JSON.stringify(newPhotos));
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update'
        });
      }

      values.push(id);
      const updateQuery = `UPDATE places SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`;

      db.query(updateQuery, values, (error, result) => {
        if (error) {
          console.error('Error updating ad:', error);
          return res.status(500).json({
            success: false,
            message: 'Database error'
          });
        }

        res.json({
          success: true,
          message: 'Ad updated successfully'
        });
      });
    });
  });

  // Get ads by owner
  static getAdsByOwner = asyncHandler(async (req, res) => {
    const { ownerId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const query = `
      SELECT * FROM places 
      WHERE owner_id = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;

    db.query(query, [ownerId, limit, offset], (error, results) => {
      if (error) {
        console.error('Error fetching ads by owner:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      const ads = results.map(ad => {
        if (ad.images) {
          ad.images = JSON.parse(ad.images);
        }
        return ad;
      });

      res.json({
        success: true,
        ads,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: ads.length
        }
      });
    });
  });

  // Get all ads
  static getAllAds = asyncHandler(async (req, res) => {
    const { category, city, is_active, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM places WHERE 1=1';
    const queryParams = [];

    if (category) {
      query += ' AND category = ?';
      queryParams.push(category);
    }
    if (city) {
      query += ' AND city LIKE ?';
      queryParams.push(`%${city}%`);
    }
    if (is_active !== undefined) {
      query += ' AND is_active = ?';
      queryParams.push(is_active);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);

    db.query(query, queryParams, (error, results) => {
      if (error) {
        console.error('Error fetching ads:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      const ads = results.map(ad => {
        if (ad.images) {
          ad.images = JSON.parse(ad.images);
        }
        return ad;
      });

      res.json({
        success: true,
        ads,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: ads.length
        }
      });
    });
  });
}

module.exports = AdsController;