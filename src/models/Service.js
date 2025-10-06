const db = require('../config/database');

class Service {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.icon = data.icon;
    this.is_car_service = data.is_car_service;
    this.is_active = data.is_active;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new service
  static async create(serviceData) {
    return new Promise((resolve, reject) => {
      const { name, description, icon, is_car_service = 0 } = serviceData;
      
      const query = `
        INSERT INTO services (name, description, icon, is_car_service, is_active, created_at)
        VALUES (?, ?, ?, ?, 1, NOW())
      `;
      
      db.query(query, [name, description, icon, is_car_service], (error, result) => {
        if (error) {
          console.error('Error creating service:', error);
          reject(error);
        } else {
          resolve({ id: result.insertId, ...serviceData, is_active: 1 });
        }
      });
    });
  }

  // Get all services
  static async findAll(filters = {}) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM services WHERE 1=1';
      const queryParams = [];
      
      // Apply filters
      if (filters.is_car_service !== undefined) {
        query += ' AND is_car_service = ?';
        queryParams.push(filters.is_car_service);
      }
      
      if (filters.is_active !== undefined) {
        query += ' AND is_active = ?';
        queryParams.push(filters.is_active);
      }
      
      query += ' ORDER BY created_at DESC';
      
      db.query(query, queryParams, (error, results) => {
        if (error) {
          console.error('Error fetching services:', error);
          reject(error);
        } else {
          const services = results.map(service => new Service(service));
          resolve(services);
        }
      });
    });
  }

  // Get service by ID
  static async findById(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM services WHERE id = ?';
      
      db.query(query, [id], (error, results) => {
        if (error) {
          console.error('Error finding service by ID:', error);
          reject(error);
        } else {
          resolve(results.length > 0 ? new Service(results[0]) : null);
        }
      });
    });
  }

  // Update service
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
      const query = `UPDATE services SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
      
      db.query(query, values, (error, result) => {
        if (error) {
          console.error('Error updating service:', error);
          reject(error);
        } else {
          Object.assign(this, updateData);
          resolve(this);
        }
      });
    });
  }

  // Delete service
  async delete() {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM services WHERE id = ?';
      
      db.query(query, [this.id], (error, result) => {
        if (error) {
          console.error('Error deleting service:', error);
          reject(error);
        } else {
          resolve(true);
        }
      });
    });
  }

  // Toggle active status
  async toggleActive() {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE services SET is_active = NOT is_active, updated_at = NOW() WHERE id = ?';
      
      db.query(query, [this.id], (error, result) => {
        if (error) {
          console.error('Error toggling service active status:', error);
          reject(error);
        } else {
          this.is_active = !this.is_active;
          resolve(this);
        }
      });
    });
  }
}

module.exports = Service;