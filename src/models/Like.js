const db = require('../config/database');

class Like {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.place_id = data.place_id;
    this.created_at = data.created_at;
  }

  // Toggle like for a place
  static async toggleLike(userId, placeId) {
    return new Promise((resolve, reject) => {
      // First check if like exists
      const checkQuery = 'SELECT id FROM likes WHERE user_id = ? AND place_id = ?';
      
      db.query(checkQuery, [userId, placeId], (error, results) => {
        if (error) {
          console.error('Error checking like:', error);
          reject(error);
          return;
        }

        if (results.length > 0) {
          // Like exists, remove it
          const deleteQuery = 'DELETE FROM likes WHERE user_id = ? AND place_id = ?';
          db.query(deleteQuery, [userId, placeId], (error, result) => {
            if (error) {
              console.error('Error removing like:', error);
              reject(error);
            } else {
              resolve({ liked: false, action: 'removed' });
            }
          });
        } else {
          // Like doesn't exist, add it
          const insertQuery = 'INSERT INTO likes (user_id, place_id, created_at) VALUES (?, ?, NOW())';
          db.query(insertQuery, [userId, placeId], (error, result) => {
            if (error) {
              console.error('Error adding like:', error);
              reject(error);
            } else {
              resolve({ liked: true, action: 'added' });
            }
          });
        }
      });
    });
  }

  // Get user's liked places
  static async getUserLikes(userId, limit = 20, offset = 0) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT l.*, p.title, p.price, p.images, p.city, p.district, p.category
        FROM likes l
        LEFT JOIN places p ON l.place_id = p.id
        WHERE l.user_id = ? AND p.is_active = 1 AND p.is_approved = 1
        ORDER BY l.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      db.query(query, [userId, limit, offset], (error, results) => {
        if (error) {
          console.error('Error fetching user likes:', error);
          reject(error);
        } else {
          const likes = results.map(like => {
            if (like.images) {
              like.images = JSON.parse(like.images);
            }
            return new Like(like);
          });
          resolve(likes);
        }
      });
    });
  }

  // Get like count for a place
  static async getPlaceLikeCount(placeId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT COUNT(*) as count FROM likes WHERE place_id = ?';
      
      db.query(query, [placeId], (error, results) => {
        if (error) {
          console.error('Error getting like count:', error);
          reject(error);
        } else {
          resolve(results[0].count);
        }
      });
    });
  }

  // Check if user liked a place
  static async hasUserLiked(userId, placeId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT id FROM likes WHERE user_id = ? AND place_id = ?';
      
      db.query(query, [userId, placeId], (error, results) => {
        if (error) {
          console.error('Error checking user like:', error);
          reject(error);
        } else {
          resolve(results.length > 0);
        }
      });
    });
  }
}

module.exports = Like;