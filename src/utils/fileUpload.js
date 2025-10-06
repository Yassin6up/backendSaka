const fs = require('fs');
const path = require('path');
const config = require('../config/app');

class FileUploadHelper {
  static createUploadDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  static getUploadPath(type) {
    const basePath = path.join(__dirname, '../../');
    switch (type) {
      case 'profile':
        return path.join(basePath, config.upload.profilesDir);
      case 'place':
        return path.join(basePath, config.upload.placesDir);
      case 'slide':
        return path.join(basePath, config.upload.slidesDir);
      case 'service':
        return path.join(basePath, config.upload.servicesDir);
      case 'temp':
      default:
        return path.join(basePath, config.upload.tempDir);
    }
  }

  static generateFileName(originalName) {
    const timestamp = Date.now();
    const extension = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, extension);
    return `${timestamp}-${nameWithoutExt}${extension}`;
  }

  static deleteFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  static getFileUrl(fileName, type = 'temp') {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const uploadDir = type === 'profile' ? 'profiles' : 
                     type === 'place' ? 'places' :
                     type === 'slide' ? 'slides' :
                     type === 'service' ? 'services' : 'temp';
    
    return `${baseUrl}/api/images/${uploadDir}/${fileName}`;
  }

  static validateImageFile(file) {
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return { valid: false, error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' };
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { valid: false, error: 'File size too large. Maximum size is 5MB.' };
    }

    return { valid: true };
  }

  static processMultipleFiles(files) {
    if (!files || files.length === 0) {
      return [];
    }

    const processedFiles = [];
    const errors = [];

    files.forEach((file, index) => {
      const validation = this.validateImageFile(file);
      if (validation.valid) {
        processedFiles.push({
          originalName: file.originalname,
          filename: file.filename,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype
        });
      } else {
        errors.push(`File ${index + 1}: ${validation.error}`);
      }
    });

    return { files: processedFiles, errors };
  }
}

module.exports = FileUploadHelper;