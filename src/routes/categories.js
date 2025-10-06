const express = require('express');
const router = express.Router();
const CategoriesController = require('../controllers/categoriesController');
const { authenticateAdmin } = require('../middleware/auth');

// Public routes
router.get('/all', CategoriesController.getAllCategories);
router.get('/slug', CategoriesController.getCategoriesWithSlugs);

// Admin routes
router.get('/admin/all', authenticateAdmin, CategoriesController.getAllCategoriesAdmin);
router.post('/admin/create', authenticateAdmin, CategoriesController.createCategory);
router.put('/admin/:id', authenticateAdmin, CategoriesController.updateCategory);
router.delete('/admin/:id', authenticateAdmin, CategoriesController.deleteCategory);
router.put('/toggle/:slug', authenticateAdmin, CategoriesController.toggleCategory);

module.exports = router;