const db = require('../config/database');

class PlaceService {
  static async createPlace(placeData) {
    return new Promise((resolve, reject) => {
      const {
        title, description, price, location, city, district, category,
        owner_id, property_type, buy_or_rent, area, rooms, bathrooms,
        floor, age, furnished, parking, elevator, balcony, garden,
        pool, security, maintenance, images, latitude, longitude
      } = placeData;

      const query = `
        INSERT INTO places (
          title, description, price, location, city, district, category,
          owner_id, property_type, buy_or_rent, area, rooms, bathrooms,
          floor, age, furnished, parking, elevator, balcony, garden,
          pool, security, maintenance, images, latitude, longitude, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;

      const values = [
        title, description, price, location, city, district, category,
        owner_id, property_type, buy_or_rent, area, rooms, bathrooms,
        floor, age, furnished, parking, elevator, balcony, garden,
        pool, security, maintenance, JSON.stringify(images), latitude, longitude
      ];

      db.query(query, values, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve({ id: result.insertId });
        }
      });
    });
  }

  static async getPlaces(filters = {}) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT p.*, u.name as owner_name, u.phone as owner_phone
        FROM places p
        LEFT JOIN users u ON p.owner_id = u.id
        WHERE 1=1
      `;
      const values = [];

      if (filters.category) {
        query += ' AND p.category = ?';
        values.push(filters.category);
      }

      if (filters.city) {
        query += ' AND p.city = ?';
        values.push(filters.city);
      }

      if (filters.property_type) {
        query += ' AND p.property_type = ?';
        values.push(filters.property_type);
      }

      if (filters.buy_or_rent) {
        query += ' AND p.buy_or_rent = ?';
        values.push(filters.buy_or_rent);
      }

      if (filters.min_price) {
        query += ' AND p.price >= ?';
        values.push(filters.min_price);
      }

      if (filters.max_price) {
        query += ' AND p.price <= ?';
        values.push(filters.max_price);
      }

      query += ' ORDER BY p.created_at DESC';

      if (filters.limit) {
        query += ' LIMIT ?';
        values.push(filters.limit);
      }

      db.query(query, values, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  static async getPlaceById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT p.*, u.name as owner_name, u.phone as owner_phone
        FROM places p
        LEFT JOIN users u ON p.owner_id = u.id
        WHERE p.id = ?
      `;

      db.query(query, [id], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0] || null);
        }
      });
    });
  }

  static async updatePlace(id, updateData) {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];

      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      });

      if (fields.length === 0) {
        return resolve({ success: true });
      }

      values.push(id);
      const query = `UPDATE places SET ${fields.join(', ')} WHERE id = ?`;

      db.query(query, values, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve({ success: true, affectedRows: result.affectedRows });
        }
      });
    });
  }

  static async deletePlace(id) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM places WHERE id = ?';
      db.query(query, [id], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve({ success: true, affectedRows: result.affectedRows });
        }
      });
    });
  }

  static async getPlacesByOwner(ownerId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM places WHERE owner_id = ? ORDER BY created_at DESC';
      db.query(query, [ownerId], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  static async searchPlaces(searchTerm, filters = {}) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT p.*, u.name as owner_name, u.phone as owner_phone
        FROM places p
        LEFT JOIN users u ON p.owner_id = u.id
        WHERE (p.title LIKE ? OR p.description LIKE ? OR p.location LIKE ?)
      `;
      const values = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`];

      if (filters.category) {
        query += ' AND p.category = ?';
        values.push(filters.category);
      }

      if (filters.city) {
        query += ' AND p.city = ?';
        values.push(filters.city);
      }

      query += ' ORDER BY p.created_at DESC';

      if (filters.limit) {
        query += ' LIMIT ?';
        values.push(filters.limit);
      }

      db.query(query, values, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }
}

module.exports = PlaceService;