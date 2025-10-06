const db = require('../config/database');
const crypto = require('crypto');

class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.password = data.password;
    this.profile_picture = data.profile_picture;
    this.is_active = data.is_active;
    this.is_verified = data.is_verified;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new user
  static async create(userData) {
    return new Promise((resolve, reject) => {
      const { name, email, phone, password } = userData;
      
      // Hash password
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
      
      const query = `
        INSERT INTO users (name, email, phone, password, created_at)
        VALUES (?, ?, ?, ?, NOW())
      `;
      
      db.query(query, [name, email, phone, hashedPassword], (error, result) => {
        if (error) {
          console.error('Error creating user:', error);
          reject(error);
        } else {
          resolve({ id: result.insertId, ...userData });
        }
      });
    });
  }

  // Find user by ID
  static async findById(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE id = ?';
      
      db.query(query, [id], (error, results) => {
        if (error) {
          console.error('Error finding user by ID:', error);
          reject(error);
        } else {
          resolve(results.length > 0 ? new User(results[0]) : null);
        }
      });
    });
  }

  // Find user by email
  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE email = ?';
      
      db.query(query, [email], (error, results) => {
        if (error) {
          console.error('Error finding user by email:', error);
          reject(error);
        } else {
          resolve(results.length > 0 ? new User(results[0]) : null);
        }
      });
    });
  }

  // Find user by phone
  static async findByPhone(phone) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE phone = ?';
      
      db.query(query, [phone], (error, results) => {
        if (error) {
          console.error('Error finding user by phone:', error);
          reject(error);
        } else {
          resolve(results.length > 0 ? new User(results[0]) : null);
        }
      });
    });
  }

  // Update user
  async update(updateData) {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];
      
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined && key !== 'id') {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      });
      
      if (fields.length === 0) {
        return resolve(this);
      }
      
      values.push(this.id);
      const query = `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
      
      db.query(query, values, (error, result) => {
        if (error) {
          console.error('Error updating user:', error);
          reject(error);
        } else {
          Object.assign(this, updateData);
          resolve(this);
        }
      });
    });
  }

  // Verify password
  verifyPassword(password) {
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    return this.password === hashedPassword;
  }

  // Search users
  static async search(searchTerm, limit = 20, offset = 0) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT id, name, email, phone, profile_picture, created_at
        FROM users 
        WHERE (name LIKE ? OR email LIKE ? OR phone LIKE ?) 
        AND is_active = 1
        ORDER BY name
        LIMIT ? OFFSET ?
      `;
      
      const searchPattern = `%${searchTerm}%`;
      
      db.query(query, [searchPattern, searchPattern, searchPattern, limit, offset], (error, results) => {
        if (error) {
          console.error('Error searching users:', error);
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  // Get user statistics
  static async getStats(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          (SELECT COUNT(*) FROM places WHERE owner_id = ?) as places_count,
          (SELECT COUNT(*) FROM bookings WHERE user_id = ?) as bookings_count,
          (SELECT COUNT(*) FROM likes WHERE user_id = ?) as likes_count
      `;
      
      db.query(query, [userId, userId, userId], (error, results) => {
        if (error) {
          console.error('Error getting user stats:', error);
          reject(error);
        } else {
          resolve(results[0]);
        }
      });
    });
  }

  // Delete user (soft delete)
  async delete() {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE users SET is_active = 0, updated_at = NOW() WHERE id = ?';
      
      db.query(query, [this.id], (error, result) => {
        if (error) {
          console.error('Error deleting user:', error);
          reject(error);
        } else {
          this.is_active = 0;
          resolve(this);
        }
      });
    });
  }
}

module.exports = User;