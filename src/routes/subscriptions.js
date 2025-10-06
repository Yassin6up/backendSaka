const express = require('express');
const router = express.Router();
const SubscriptionsController = require('../controllers/subscriptionsController');
const { authenticateAdmin } = require('../middleware/auth');

// Public routes
router.get('/api/subscriptions', SubscriptionsController.getAllSubscriptions);

// Admin routes
router.post('/api/subscriptions', authenticateAdmin, SubscriptionsController.createSubscription);
router.put('/api/subscriptions/:id', authenticateAdmin, SubscriptionsController.updateSubscription);
router.delete('/api/subscriptions/:id', authenticateAdmin, SubscriptionsController.deleteSubscription);

module.exports = router;