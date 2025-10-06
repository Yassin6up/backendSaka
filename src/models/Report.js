const db = require('../config/database');

class Report {
  constructor(data) {
    this.id = data.id;
    this.crimeType = data.crimeType;
    this.victimNumber = data.victimNumber;
    this.description = data.description;
    this.placeId = data.placeId;
    this.reportType = data.reportType;
    this.userId = data.userId;
    this.status = data.status;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new report
  static async create(reportData) {
    return new Promise((resolve, reject) => {
      const { crimeType, victimNumber, description, placeId, reportType, userId } = reportData;
      
      const query = `
        INSERT INTO reports (crimeType, victimNumber, description, placeId, reportType, userId, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())
      `;
      
      db.query(query, [crimeType, victimNumber, description, placeId, reportType, userId], (error, result) => {
        if (error) {
          console.error('Error creating report:', error);
          reject(error);
        } else {
          resolve({ id: result.insertId, ...reportData, status: 'pending' });
        }
      });
    });
  }

  // Get all reports with filters
  static async findAll(filters = {}, limit = 20, offset = 0) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT r.*, u.name as user_name, u.phone as user_phone,
               p.title as place_title, p.owner_id as place_owner_id
        FROM reports r
        LEFT JOIN users u ON r.userId = u.id
        LEFT JOIN places p ON r.placeId = p.id
        WHERE 1=1
      `;
      
      const queryParams = [];
      
      // Apply filters
      if (filters.status) {
        query += ' AND r.status = ?';
        queryParams.push(filters.status);
      }
      
      if (filters.reportType) {
        query += ' AND r.reportType = ?';
        queryParams.push(filters.reportType);
      }
      
      if (filters.crimeType) {
        query += ' AND r.crimeType = ?';
        queryParams.push(filters.crimeType);
      }
      
      query += ' ORDER BY r.created_at DESC';
      query += ' LIMIT ? OFFSET ?';
      queryParams.push(limit, offset);
      
      db.query(query, queryParams, (error, results) => {
        if (error) {
          console.error('Error fetching reports:', error);
          reject(error);
        } else {
          const reports = results.map(report => new Report(report));
          resolve(reports);
        }
      });
    });
  }

  // Get report by ID
  static async findById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT r.*, u.name as user_name, u.phone as user_phone,
               p.title as place_title, p.owner_id as place_owner_id
        FROM reports r
        LEFT JOIN users u ON r.userId = u.id
        LEFT JOIN places p ON r.placeId = p.id
        WHERE r.id = ?
      `;
      
      db.query(query, [id], (error, results) => {
        if (error) {
          console.error('Error finding report by ID:', error);
          reject(error);
        } else {
          resolve(results.length > 0 ? new Report(results[0]) : null);
        }
      });
    });
  }

  // Update report status
  static async updateStatus(reportId, status) {
    return new Promise((resolve, reject) => {
      const validStatuses = ['pending', 'under_review', 'resolved', 'dismissed'];
      
      if (!validStatuses.includes(status)) {
        return reject(new Error('Invalid status'));
      }

      const query = 'UPDATE reports SET status = ?, updated_at = NOW() WHERE id = ?';
      
      db.query(query, [status, reportId], (error, result) => {
        if (error) {
          console.error('Error updating report status:', error);
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  // Get reports by user
  static async getByUser(userId, limit = 20, offset = 0) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT r.*, p.title as place_title
        FROM reports r
        LEFT JOIN places p ON r.placeId = p.id
        WHERE r.userId = ?
        ORDER BY r.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      db.query(query, [userId, limit, offset], (error, results) => {
        if (error) {
          console.error('Error fetching user reports:', error);
          reject(error);
        } else {
          const reports = results.map(report => new Report(report));
          resolve(reports);
        }
      });
    });
  }

  // Delete report
  async delete() {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM reports WHERE id = ?';
      
      db.query(query, [this.id], (error, result) => {
        if (error) {
          console.error('Error deleting report:', error);
          reject(error);
        } else {
          resolve(true);
        }
      });
    });
  }
}

module.exports = Report;