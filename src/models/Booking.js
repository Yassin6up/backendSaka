const db = require('../config/database');

class Booking {
  constructor(data) {
    this.id = data.id;
    this.place_id = data.place_id;
    this.user_id = data.user_id;
    this.booking_date = data.booking_date;
    this.message = data.message;
    this.status = data.status;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new booking
  static async create(bookingData) {
    return new Promise((resolve, reject) => {
      const { place_id, user_id, booking_date, message } = bookingData;
      
      const query = `
        INSERT INTO bookings (place_id, user_id, booking_date, message, status, created_at)
        VALUES (?, ?, ?, ?, 'pending', NOW())
      `;
      
      db.query(query, [place_id, user_id, booking_date, message], (error, result) => {
        if (error) {
          console.error('Error creating booking:', error);
          reject(error);
        } else {
          resolve({ id: result.insertId, ...bookingData, status: 'pending' });
        }
      });
    });
  }

  // Find booking by ID
  static async findById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT b.*, p.title as place_title, u.name as user_name, u.phone as user_phone
        FROM bookings b
        LEFT JOIN places p ON b.place_id = p.id
        LEFT JOIN users u ON b.user_id = u.id
        WHERE b.id = ?
      `;
      
      db.query(query, [id], (error, results) => {
        if (error) {
          console.error('Error finding booking by ID:', error);
          reject(error);
        } else {
          resolve(results.length > 0 ? new Booking(results[0]) : null);
        }
      });
    });
  }

  // Get all bookings
  static async findAll(filters = {}, limit = 20, offset = 0) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT b.*, p.title as place_title, u.name as user_name, u.phone as user_phone
        FROM bookings b
        LEFT JOIN places p ON b.place_id = p.id
        LEFT JOIN users u ON b.user_id = u.id
        WHERE 1=1
      `;
      
      const queryParams = [];
      
      // Apply filters
      if (filters.place_id) {
        query += ' AND b.place_id = ?';
        queryParams.push(filters.place_id);
      }
      
      if (filters.user_id) {
        query += ' AND b.user_id = ?';
        queryParams.push(filters.user_id);
      }
      
      if (filters.status) {
        query += ' AND b.status = ?';
        queryParams.push(filters.status);
      }
      
      query += ' ORDER BY b.created_at DESC';
      query += ' LIMIT ? OFFSET ?';
      queryParams.push(limit, offset);
      
      db.query(query, queryParams, (error, results) => {
        if (error) {
          console.error('Error finding bookings:', error);
          reject(error);
        } else {
          const bookings = results.map(booking => new Booking(booking));
          resolve(bookings);
        }
      });
    });
  }

  // Get bookings by user
  static async findByUser(userId, limit = 20, offset = 0) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT b.*, p.title as place_title, p.price, p.images, p.city, p.district
        FROM bookings b
        LEFT JOIN places p ON b.place_id = p.id
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      db.query(query, [userId, limit, offset], (error, results) => {
        if (error) {
          console.error('Error finding bookings by user:', error);
          reject(error);
        } else {
          const bookings = results.map(booking => {
            if (booking.images) {
              booking.images = JSON.parse(booking.images);
            }
            return new Booking(booking);
          });
          resolve(bookings);
        }
      });
    });
  }

  // Update booking
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
      const query = `UPDATE bookings SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
      
      db.query(query, values, (error, result) => {
        if (error) {
          console.error('Error updating booking:', error);
          reject(error);
        } else {
          Object.assign(this, updateData);
          resolve(this);
        }
      });
    });
  }

  // Update booking status
  static async updateStatus(bookingId, status) {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE bookings SET status = ?, updated_at = NOW() WHERE id = ?';
      
      db.query(query, [status, bookingId], (error, result) => {
        if (error) {
          console.error('Error updating booking status:', error);
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  // Get booking titles for a place
  static async getTitlesByPlace(placeId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT b.id, b.booking_date, b.status, u.name as user_name
        FROM bookings b
        LEFT JOIN users u ON b.user_id = u.id
        WHERE b.place_id = ?
        ORDER BY b.created_at DESC
      `;
      
      db.query(query, [placeId], (error, results) => {
        if (error) {
          console.error('Error getting booking titles:', error);
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  // Delete booking
  async delete() {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM bookings WHERE id = ?';
      
      db.query(query, [this.id], (error, result) => {
        if (error) {
          console.error('Error deleting booking:', error);
          reject(error);
        } else {
          resolve(true);
        }
      });
    });
  }
}

module.exports = Booking;