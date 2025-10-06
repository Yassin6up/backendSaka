const db = require('../config/database');

class BookingService {
  static async createBooking(bookingData) {
    return new Promise((resolve, reject) => {
      const {
        user_id, place_id, owner_id, title, message, phone, email,
        visit_date, visit_time, status = 'pending'
      } = bookingData;

      const query = `
        INSERT INTO bookings (
          user_id, place_id, owner_id, title, message, phone, email,
          visit_date, visit_time, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;

      const values = [
        user_id, place_id, owner_id, title, message, phone, email,
        visit_date, visit_time, status
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

  static async getBookings(filters = {}) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT b.*, p.title as place_title, p.location as place_location,
               u.name as user_name, o.name as owner_name
        FROM bookings b
        LEFT JOIN places p ON b.place_id = p.id
        LEFT JOIN users u ON b.user_id = u.id
        LEFT JOIN users o ON b.owner_id = o.id
        WHERE 1=1
      `;
      const values = [];

      if (filters.user_id) {
        query += ' AND b.user_id = ?';
        values.push(filters.user_id);
      }

      if (filters.owner_id) {
        query += ' AND b.owner_id = ?';
        values.push(filters.owner_id);
      }

      if (filters.status) {
        query += ' AND b.status = ?';
        values.push(filters.status);
      }

      query += ' ORDER BY b.created_at DESC';

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

  static async getBookingById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT b.*, p.title as place_title, p.location as place_location,
               u.name as user_name, o.name as owner_name
        FROM bookings b
        LEFT JOIN places p ON b.place_id = p.id
        LEFT JOIN users u ON b.user_id = u.id
        LEFT JOIN users o ON b.owner_id = o.id
        WHERE b.id = ?
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

  static async updateBookingStatus(id, status) {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE bookings SET status = ?, updated_at = NOW() WHERE id = ?';
      db.query(query, [status, id], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve({ success: true, affectedRows: result.affectedRows });
        }
      });
    });
  }

  static async deleteBooking(id) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM bookings WHERE id = ?';
      db.query(query, [id], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve({ success: true, affectedRows: result.affectedRows });
        }
      });
    });
  }

  static async getBookingTitles(placeId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT id, title, visit_date, visit_time, status
        FROM bookings
        WHERE place_id = ?
        ORDER BY created_at DESC
      `;

      db.query(query, [placeId], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }
}

module.exports = BookingService;