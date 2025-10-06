const db = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

class CategoriesController {
  // Get all categories
  static getAllCategories = asyncHandler(async (req, res) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM categories WHERE is_active = 1 ORDER BY name';
      
      db.query(query, (error, results) => {
        if (error) {
          console.error('Error fetching categories:', error);
          reject(error);
        } else {
          resolve(results);
        }
      });
    }).then(categories => {
      res.json({
        success: true,
        categories
      });
    });
  });

  // Get all categories with slugs
  static getCategoriesWithSlugs = asyncHandler(async (req, res) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT id, name, slug, icon FROM categories WHERE is_active = 1 ORDER BY name';
      
      db.query(query, (error, results) => {
        if (error) {
          console.error('Error fetching categories with slugs:', error);
          reject(error);
        } else {
          resolve(results);
        }
      });
    }).then(categories => {
      res.json({
        success: true,
        categories
      });
    });
  });

  // Get all categories for admin
  static getAllCategoriesAdmin = asyncHandler(async (req, res) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM categories ORDER BY name';
      
      db.query(query, (error, results) => {
        if (error) {
          console.error('Error fetching all categories for admin:', error);
          reject(error);
        } else {
          resolve(results);
        }
      });
    }).then(categories => {
      res.json({
        success: true,
        categories
      });
    });
  });

  // Toggle category active status
  static toggleCategory = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    return new Promise((resolve, reject) => {
      const query = 'UPDATE categories SET is_active = NOT is_active WHERE slug = ?';
      
      db.query(query, [slug], (error, result) => {
        if (error) {
          console.error('Error toggling category:', error);
          reject(error);
        } else {
          if (result.affectedRows === 0) {
            reject(new Error('Category not found'));
          } else {
            resolve(result);
          }
        }
      });
    }).then(() => {
      res.json({
        success: true,
        message: 'Category status updated successfully'
      });
    });
  });

  // Create new category
  static createCategory = asyncHandler(async (req, res) => {
    const { name, slug, icon, description } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Name and slug are required'
      });
    }

    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO categories (name, slug, icon, description, is_active, created_at)
        VALUES (?, ?, ?, ?, 1, NOW())
      `;
      
      db.query(query, [name, slug, icon, description], (error, result) => {
        if (error) {
          console.error('Error creating category:', error);
          reject(error);
        } else {
          resolve({ id: result.insertId, name, slug, icon, description });
        }
      });
    }).then(category => {
      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        category
      });
    });
  });

  // Update category
  static updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, slug, icon, description, is_active } = req.body;

    return new Promise((resolve, reject) => {
      const query = `
        UPDATE categories 
        SET name = ?, slug = ?, icon = ?, description = ?, is_active = ?, updated_at = NOW()
        WHERE id = ?
      `;
      
      db.query(query, [name, slug, icon, description, is_active, id], (error, result) => {
        if (error) {
          console.error('Error updating category:', error);
          reject(error);
        } else {
          if (result.affectedRows === 0) {
            reject(new Error('Category not found'));
          } else {
            resolve(result);
          }
        }
      });
    }).then(() => {
      res.json({
        success: true,
        message: 'Category updated successfully'
      });
    });
  });

  // Delete category
  static deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM categories WHERE id = ?';
      
      db.query(query, [id], (error, result) => {
        if (error) {
          console.error('Error deleting category:', error);
          reject(error);
        } else {
          if (result.affectedRows === 0) {
            reject(new Error('Category not found'));
          } else {
            resolve(result);
          }
        }
      });
    }).then(() => {
      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    });
  });
}

module.exports = CategoriesController;