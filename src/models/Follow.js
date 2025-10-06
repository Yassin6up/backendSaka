const db = require('../config/database');

class Follow {
  constructor(data) {
    this.id = data.id;
    this.follower_id = data.follower_id;
    this.followee_id = data.followee_id;
    this.created_at = data.created_at;
  }

  // Toggle follow relationship
  static async toggleFollow(followerId, followeeId) {
    return new Promise((resolve, reject) => {
      // First check if follow exists
      const checkQuery = 'SELECT id FROM followers WHERE follower_id = ? AND followee_id = ?';
      
      db.query(checkQuery, [followerId, followeeId], (error, results) => {
        if (error) {
          console.error('Error checking follow:', error);
          reject(error);
          return;
        }

        if (results.length > 0) {
          // Follow exists, remove it
          const deleteQuery = 'DELETE FROM followers WHERE follower_id = ? AND followee_id = ?';
          db.query(deleteQuery, [followerId, followeeId], (error, result) => {
            if (error) {
              console.error('Error removing follow:', error);
              reject(error);
            } else {
              resolve({ following: false, action: 'unfollowed' });
            }
          });
        } else {
          // Follow doesn't exist, add it
          const insertQuery = 'INSERT INTO followers (follower_id, followee_id, created_at) VALUES (?, ?, NOW())';
          db.query(insertQuery, [followerId, followeeId], (error, result) => {
            if (error) {
              console.error('Error adding follow:', error);
              reject(error);
            } else {
              resolve({ following: true, action: 'followed' });
            }
          });
        }
      });
    });
  }

  // Get user's followers
  static async getFollowers(userId, limit = 20, offset = 0) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT f.*, u.name as follower_name, u.profile_picture, u.id as follower_id
        FROM followers f
        LEFT JOIN users u ON f.follower_id = u.id
        WHERE f.followee_id = ?
        ORDER BY f.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      db.query(query, [userId, limit, offset], (error, results) => {
        if (error) {
          console.error('Error fetching followers:', error);
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  // Get user's following
  static async getFollowing(userId, limit = 20, offset = 0) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT f.*, u.name as followee_name, u.profile_picture, u.id as followee_id
        FROM followers f
        LEFT JOIN users u ON f.followee_id = u.id
        WHERE f.follower_id = ?
        ORDER BY f.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      db.query(query, [userId, limit, offset], (error, results) => {
        if (error) {
          console.error('Error fetching following:', error);
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  // Get follow counts for a user
  static async getFollowCounts(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          (SELECT COUNT(*) FROM followers WHERE followee_id = ?) as followers_count,
          (SELECT COUNT(*) FROM followers WHERE follower_id = ?) as following_count
      `;
      
      db.query(query, [userId, userId], (error, results) => {
        if (error) {
          console.error('Error getting follow counts:', error);
          reject(error);
        } else {
          resolve(results[0]);
        }
      });
    });
  }

  // Check if user is following another user
  static async isFollowing(followerId, followeeId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT id FROM followers WHERE follower_id = ? AND followee_id = ?';
      
      db.query(query, [followerId, followeeId], (error, results) => {
        if (error) {
          console.error('Error checking follow status:', error);
          reject(error);
        } else {
          resolve(results.length > 0);
        }
      });
    });
  }
}

module.exports = Follow;