const db = require('../config/database');

class Place {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.price = data.price;
    this.category = data.category;
    this.city = data.city;
    this.district = data.district;
    this.owner_id = data.owner_id;
    this.images = data.images;
    this.is_active = data.is_active;
    this.is_approved = data.is_approved;
    this.views = data.views;
    this.likes_count = data.likes_count;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new place
  static async create(placeData) {
    return new Promise((resolve, reject) => {
      const { title, description, price, category, city, district, owner_id, images } = placeData;
      
      const query = `
        INSERT INTO places (title, description, price, category, city, district, owner_id, images, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      
      const imagesJson = JSON.stringify(images || []);
      
      db.query(query, [title, description, price, category, city, district, owner_id, imagesJson], (error, result) => {
        if (error) {
          console.error('Error creating place:', error);
          reject(error);
        } else {
          resolve({ id: result.insertId, ...placeData });
        }
      });
    });
  }

  // Find place by ID
  static async findById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT p.*, u.name as owner_name, u.phone as owner_phone
        FROM places p
        LEFT JOIN users u ON p.owner_id = u.id
        WHERE p.id = ?
      `;
      
      db.query(query, [id], (error, results) => {
        if (error) {
          console.error('Error finding place by ID:', error);
          reject(error);
        } else {
          if (results.length > 0) {
            const place = results[0];
            place.images = JSON.parse(place.images || '[]');
            resolve(new Place(place));
          } else {
            resolve(null);
          }
        }
      });
    });
  }

  // Get all places with pagination
  static async findAll(filters = {}, limit = 20, offset = 0) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT p.*, u.name as owner_name, u.phone as owner_phone
        FROM places p
        LEFT JOIN users u ON p.owner_id = u.id
        WHERE p.is_active = 1 AND p.is_approved = 1
      `;
      
      const queryParams = [];
      
      // Apply filters
      if (filters.category) {
        query += ' AND p.category = ?';
        queryParams.push(filters.category);
      }
      
      if (filters.city) {
        query += ' AND p.city = ?';
        queryParams.push(filters.city);
      }
      
      if (filters.district) {
        query += ' AND p.district = ?';
        queryParams.push(filters.district);
      }
      
      if (filters.minPrice) {
        query += ' AND p.price >= ?';
        queryParams.push(filters.minPrice);
      }
      
      if (filters.maxPrice) {
        query += ' AND p.price <= ?';
        queryParams.push(filters.maxPrice);
      }
      
      if (filters.search) {
        query += ' AND (p.title LIKE ? OR p.description LIKE ?)';
        const searchPattern = `%${filters.search}%`;
        queryParams.push(searchPattern, searchPattern);
      }
      
      query += ' ORDER BY p.created_at DESC';
      query += ' LIMIT ? OFFSET ?';
      queryParams.push(limit, offset);
      
      db.query(query, queryParams, (error, results) => {
        if (error) {
          console.error('Error finding places:', error);
          reject(error);
        } else {
          const places = results.map(place => {
            place.images = JSON.parse(place.images || '[]');
            return new Place(place);
          });
          resolve(places);
        }
      });
    });
  }

  // Get places by owner
  static async findByOwner(ownerId, limit = 20, offset = 0) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM places 
        WHERE owner_id = ? 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `;
      
      db.query(query, [ownerId, limit, offset], (error, results) => {
        if (error) {
          console.error('Error finding places by owner:', error);
          reject(error);
        } else {
          const places = results.map(place => {
            place.images = JSON.parse(place.images || '[]');
            return new Place(place);
          });
          resolve(places);
        }
      });
    });
  }

  // Update place
  async update(updateData) {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];
      
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined && key !== 'id') {
          fields.push(`${key} = ?`);
          if (key === 'images') {
            values.push(JSON.stringify(updateData[key]));
          } else {
            values.push(updateData[key]);
          }
        }
      });
      
      if (fields.length === 0) {
        return resolve(this);
      }
      
      values.push(this.id);
      const query = `UPDATE places SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
      
      db.query(query, values, (error, result) => {
        if (error) {
          console.error('Error updating place:', error);
          reject(error);
        } else {
          Object.assign(this, updateData);
          resolve(this);
        }
      });
    });
  }

  // Increment views
  async incrementViews() {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE places SET views = views + 1 WHERE id = ?';
      
      db.query(query, [this.id], (error, result) => {
        if (error) {
          console.error('Error incrementing views:', error);
          reject(error);
        } else {
          this.views += 1;
          resolve(this);
        }
      });
    });
  }

  // Toggle active status
  async toggleActive() {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE places SET is_active = NOT is_active, updated_at = NOW() WHERE id = ?';
      
      db.query(query, [this.id], (error, result) => {
        if (error) {
          console.error('Error toggling place active status:', error);
          reject(error);
        } else {
          this.is_active = !this.is_active;
          resolve(this);
        }
      });
    });
  }

  // Approve place
  async approve() {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE places SET is_approved = 1, updated_at = NOW() WHERE id = ?';
      
      db.query(query, [this.id], (error, result) => {
        if (error) {
          console.error('Error approving place:', error);
          reject(error);
        } else {
          this.is_approved = 1;
          resolve(this);
        }
      });
    });
  }

  // Get similar places
  static async getSimilar(placeId, category, limit = 5) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM places 
        WHERE category = ? AND id != ? AND is_active = 1 AND is_approved = 1
        ORDER BY created_at DESC 
        LIMIT ?
      `;
      
      db.query(query, [category, placeId, limit], (error, results) => {
        if (error) {
          console.error('Error getting similar places:', error);
          reject(error);
        } else {
          const places = results.map(place => {
            place.images = JSON.parse(place.images || '[]');
            return new Place(place);
          });
          resolve(places);
        }
      });
    });
  }

  // Get category counts
  static async getCategoryCounts() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT category, COUNT(*) as count 
        FROM places 
        WHERE is_active = 1 AND is_approved = 1 
        GROUP BY category
      `;
      
      db.query(query, (error, results) => {
        if (error) {
          console.error('Error getting category counts:', error);
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  // Delete place
  async delete() {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM places WHERE id = ?';
      
      db.query(query, [this.id], (error, result) => {
        if (error) {
          console.error('Error deleting place:', error);
          reject(error);
        } else {
          resolve(true);
        }
      });
    });
  }
}

module.exports = Place;