const db = require('../config/database');

class Review {
  constructor(data) {
    this.id = data.id;
    this.place_id = data.place_id;
    this.user_id = data.user_id;
    this.comment = data.comment;
    this.rating = data.rating;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new review
  static async create(reviewData) {
    return new Promise((resolve, reject) => {
      const { place_id, user_id, comment, rating } = reviewData;
      
      const query = `
        INSERT INTO reviews (place_id, user_id, comment, rating, created_at)
        VALUES (?, ?, ?, ?, NOW())
      `;
      
      db.query(query, [place_id, user_id, comment, rating], (error, result) => {
        if (error) {
          console.error('Error creating review:', error);
          reject(error);
        } else {
          resolve({ id: result.insertId, ...reviewData });
        }
      });
    });
  }

  // Get reviews for a place with pagination
  static async getByPlace(placeId, page = 1, limit = 10) {
    return new Promise((resolve, reject) => {
      const offset = (page - 1) * limit;
      
      const query = `
        SELECT r.*, u.name as user_name, u.profile_picture
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.place_id = ?
        ORDER BY r.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      db.query(query, [placeId, limit, offset], (error, results) => {
        if (error) {
          console.error('Error fetching reviews:', error);
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  // Get review summary for a place
  static async getSummary(placeId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          COUNT(*) AS total_reviews, 
          AVG(rating) AS average_rating
        FROM reviews
        WHERE place_id = ?
      `;
      
      db.query(query, [placeId], (error, results) => {
        if (error) {
          console.error('Error fetching review summary:', error);
          reject(error);
        } else {
          resolve(results[0]);
        }
      });
    });
  }

  // Check if user has already reviewed a place
  static async hasUserReviewed(placeId, userId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT id FROM reviews WHERE place_id = ? AND user_id = ?';
      
      db.query(query, [placeId, userId], (error, results) => {
        if (error) {
          console.error('Error checking user review:', error);
          reject(error);
        } else {
          resolve(results.length > 0);
        }
      });
    });
  }

  // Update review
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
      const query = `UPDATE reviews SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
      
      db.query(query, values, (error, result) => {
        if (error) {
          console.error('Error updating review:', error);
          reject(error);
        } else {
          Object.assign(this, updateData);
          resolve(this);
        }
      });
    });
  }

  // Delete review
  async delete() {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM reviews WHERE id = ?';
      
      db.query(query, [this.id], (error, result) => {
        if (error) {
          console.error('Error deleting review:', error);
          reject(error);
        } else {
          resolve(true);
        }
      });
    });
  }

  // Get reviews by user
  static async getByUser(userId, limit = 10, offset = 0) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT r.*, p.title as place_title, p.images
        FROM reviews r
        LEFT JOIN places p ON r.place_id = p.id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      db.query(query, [userId, limit, offset], (error, results) => {
        if (error) {
          console.error('Error fetching user reviews:', error);
          reject(error);
        } else {
          const reviews = results.map(review => {
            if (review.images) {
              review.images = JSON.parse(review.images);
            }
            return new Review(review);
          });
          resolve(reviews);
        }
      });
    });
  }
}

module.exports = Review;