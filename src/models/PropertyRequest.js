const db = require('../config/database');

class PropertyRequest {
  constructor(data) {
    this.id = data.id;
    this.request_type = data.request_type;
    this.property_type = data.property_type;
    this.city = data.city;
    this.details = data.details;
    this.budget_min = data.budget_min;
    this.budget_max = data.budget_max;
    this.payment_method = data.payment_method;
    this.area_min = data.area_min;
    this.area_max = data.area_max;
    this.name = data.name;
    this.phone = data.phone;
    this.user_type = data.user_type;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new property request
  static async create(requestData) {
    return new Promise((resolve, reject) => {
      const {
        request_type,
        property_type,
        city,
        details,
        budget_min,
        budget_max,
        payment_method,
        area_min,
        area_max,
        name,
        phone,
        user_type
      } = requestData;
      
      const query = `
        INSERT INTO property_requests 
        (request_type, property_type, city, details, budget_min, budget_max, 
         payment_method, area_min, area_max, name, phone, user_type, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      
      const values = [
        request_type,
        property_type,
        city,
        details,
        budget_min,
        budget_max,
        payment_method,
        area_min,
        area_max,
        name,
        phone,
        user_type
      ];
      
      db.query(query, values, (error, result) => {
        if (error) {
          console.error('Error creating property request:', error);
          reject(error);
        } else {
          resolve({ id: result.insertId, ...requestData });
        }
      });
    });
  }

  // Get all property requests
  static async findAll(filters = {}, limit = 20, offset = 0) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM property_requests WHERE 1=1';
      const queryParams = [];
      
      // Apply filters
      if (filters.request_type) {
        query += ' AND request_type = ?';
        queryParams.push(filters.request_type);
      }
      
      if (filters.property_type) {
        query += ' AND property_type = ?';
        queryParams.push(filters.property_type);
      }
      
      if (filters.city) {
        query += ' AND city LIKE ?';
        queryParams.push(`%${filters.city}%`);
      }
      
      if (filters.user_type) {
        query += ' AND user_type = ?';
        queryParams.push(filters.user_type);
      }
      
      query += ' ORDER BY created_at DESC';
      query += ' LIMIT ? OFFSET ?';
      queryParams.push(limit, offset);
      
      db.query(query, queryParams, (error, results) => {
        if (error) {
          console.error('Error fetching property requests:', error);
          reject(error);
        } else {
          const requests = results.map(request => new PropertyRequest(request));
          resolve(requests);
        }
      });
    });
  }

  // Get matching requests based on interests and location
  static async getMatchingRequests(interests, userCity, userDistrict, limit = 20) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT * FROM property_requests 
        WHERE property_type IN (?) 
        OR city LIKE ? 
        OR city LIKE ?
      `;
      
      let queryParams = [
        interests,
        `%${userCity}%`,
        `%${userDistrict}%`
      ];
      
      // If user has both city and district, add more specific search
      if (userCity && userDistrict) {
        query += ` OR city LIKE ?`;
        queryParams.push(`%${userCity},%${userDistrict}%`);
      }
      
      query += ` ORDER BY created_at DESC LIMIT ?`;
      queryParams.push(limit);
      
      db.query(query, queryParams, (error, results) => {
        if (error) {
          console.error('Error fetching matching requests:', error);
          reject(error);
        } else {
          const requests = results.map(request => new PropertyRequest(request));
          resolve(requests);
        }
      });
    });
  }

  // Get request by ID
  static async findById(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM property_requests WHERE id = ?';
      
      db.query(query, [id], (error, results) => {
        if (error) {
          console.error('Error finding property request by ID:', error);
          reject(error);
        } else {
          resolve(results.length > 0 ? new PropertyRequest(results[0]) : null);
        }
      });
    });
  }

  // Update request
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
      const query = `UPDATE property_requests SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
      
      db.query(query, values, (error, result) => {
        if (error) {
          console.error('Error updating property request:', error);
          reject(error);
        } else {
          Object.assign(this, updateData);
          resolve(this);
        }
      });
    });
  }

  // Delete request
  async delete() {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM property_requests WHERE id = ?';
      
      db.query(query, [this.id], (error, result) => {
        if (error) {
          console.error('Error deleting property request:', error);
          reject(error);
        } else {
          resolve(true);
        }
      });
    });
  }
}

module.exports = PropertyRequest;