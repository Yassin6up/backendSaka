const db = require('../config/database');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

class UserService {
  static generateToken() {
    return uuidv4();
  }

  static hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  static async createUser(userData) {
    return new Promise((resolve, reject) => {
      const { name, email, phone, password, city, district } = userData;
      const token = this.generateToken();
      const hashedPassword = this.hashPassword(password);

      const query = `
        INSERT INTO users (name, email, phone, password, token, city, district, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `;

      db.query(query, [name, email, phone, hashedPassword, token, city, district], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve({ id: result.insertId, token });
        }
      });
    });
  }

  static async findUserByEmail(email) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE email = ?';
      db.query(query, [email], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0] || null);
        }
      });
    });
  }

  static async findUserByPhone(phone) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE phone = ?';
      db.query(query, [phone], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0] || null);
        }
      });
    });
  }

  static async findUserById(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE id = ?';
      db.query(query, [id], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0] || null);
        }
      });
    });
  }

  static async updateUser(id, updateData) {
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
      const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;

      db.query(query, values, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve({ success: true, affectedRows: result.affectedRows });
        }
      });
    });
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return this.hashPassword(plainPassword) === hashedPassword;
  }
}

module.exports = UserService;