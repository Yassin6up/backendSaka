const db = require('../config/database');

class UserInterest {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.interest = data.interest;
    this.city = data.city;
    this.district = data.district;
    this.created_at = data.created_at;
  }

  // Save user interests (replace existing ones)
  static async saveUserInterests(userId, interests, city, district) {
    return new Promise((resolve, reject) => {
      // Combine city and district into a single string
      const location = district ? `${city},${district}` : city;

      // Delete existing interests for this user
      const deleteQuery = 'DELETE FROM user_interests WHERE user_id = ?';
      
      db.query(deleteQuery, [userId], (error) => {
        if (error) {
          console.error('Error deleting existing interests:', error);
          reject(error);
          return;
        }

        // If no interests to insert, just return success
        if (interests.length === 0) {
          return resolve({ 
            success: true, 
            message: 'Interests cleared successfully',
            interestsCount: 0
          });
        }

        // Create placeholders for multiple rows
        const placeholders = interests.map(() => '(?, ?, ?)').join(', ');
        
        // Flatten the values array
        const flattenedValues = [];
        interests.forEach(interest => {
          flattenedValues.push(userId, interest, location);
        });

        // Insert new interests
        const insertQuery = `INSERT INTO user_interests (user_id, interest, city) VALUES ${placeholders}`;
        
        db.query(insertQuery, flattenedValues, (error, results) => {
          if (error) {
            console.error('Error inserting interests:', error);
            reject(error);
          } else {
            resolve({ 
              success: true, 
              message: 'Interests and location saved successfully',
              interestsCount: results.affectedRows
            });
          }
        });
      });
    });
  }

  // Get user interests
  static async getUserInterests(userId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT interest, city, district FROM user_interests WHERE user_id = ?';
      
      db.query(query, [userId], (error, results) => {
        if (error) {
          console.error('Error fetching user interests:', error);
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  // Get all interests
  static async getAllInterests() {
    return new Promise((resolve, reject) => {
      const query = 'SELECT DISTINCT interest FROM user_interests ORDER BY interest';
      
      db.query(query, (error, results) => {
        if (error) {
          console.error('Error fetching all interests:', error);
          reject(error);
        } else {
          resolve(results.map(row => row.interest));
        }
      });
    });
  }

  // Get users by interest
  static async getUsersByInterest(interest, limit = 20, offset = 0) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT DISTINCT u.id, u.name, u.email, u.phone, u.profile_picture
        FROM users u
        INNER JOIN user_interests ui ON u.id = ui.user_id
        WHERE ui.interest = ?
        ORDER BY u.name
        LIMIT ? OFFSET ?
      `;
      
      db.query(query, [interest, limit, offset], (error, results) => {
        if (error) {
          console.error('Error fetching users by interest:', error);
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  // Delete user interests
  static async deleteUserInterests(userId) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM user_interests WHERE user_id = ?';
      
      db.query(query, [userId], (error, result) => {
        if (error) {
          console.error('Error deleting user interests:', error);
          reject(error);
        } else {
          resolve(result.affectedRows);
        }
      });
    });
  }
}

module.exports = UserInterest;