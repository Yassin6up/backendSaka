const db = require('../config/database');
const path = require('path');
const fs = require('fs');
const { asyncHandler } = require('../middleware/errorHandler');

class SlidesController {
  // Create a new slide
  static createSlide = asyncHandler(async (req, res) => {
    const file = req.file;
    const { serviceId } = req.body;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Slide image is required'
      });
    }

    const slideData = {
      filename: file.filename,
      originalName: file.originalname,
      serviceId: serviceId || null,
      created_at: new Date()
    };

    const query = 'INSERT INTO sliders (filename, original_name, service_id, created_at) VALUES (?, ?, ?, ?)';
    
    db.query(query, [slideData.filename, slideData.originalName, slideData.serviceId, slideData.created_at], (error, result) => {
      if (error) {
        console.error('Error creating slide:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      res.status(201).json({
        success: true,
        message: 'Slide created successfully',
        slide: {
          id: result.insertId,
          filename: slideData.filename,
          originalName: slideData.originalName,
          serviceId: slideData.serviceId
        }
      });
    });
  });

  // Get all slides
  static getAllSlides = asyncHandler(async (req, res) => {
    const query = 'SELECT * FROM sliders ORDER BY created_at DESC';
    
    db.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching slides:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      res.json({
        success: true,
        slides: results
      });
    });
  });

  // Get single slide
  static getSlide = asyncHandler(async (req, res) => {
    const { fileName } = req.params;
    const filePath = path.join(__dirname, '../../uploads/slides', fileName);
    
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({
        success: false,
        message: 'Slide not found'
      });
    }
  });

  // Get icon
  static getIcon = asyncHandler(async (req, res) => {
    const { fileName } = req.params;
    const filePath = path.join(__dirname, '../../uploads/icons', fileName);
    
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({
        success: false,
        message: 'Icon not found'
      });
    }
  });

  // Delete slide
  static deleteSlide = asyncHandler(async (req, res) => {
    const { fileName } = req.params;

    // Delete from database
    const query = 'DELETE FROM sliders WHERE filename = ?';
    
    db.query(query, [fileName], (error, result) => {
      if (error) {
        console.error('Error deleting slide from database:', error);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      // Delete file from filesystem
      const filePath = path.join(__dirname, '../../uploads/slides', fileName);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      res.json({
        success: true,
        message: 'Slide deleted successfully'
      });
    });
  });
}

module.exports = SlidesController;