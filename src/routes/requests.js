const express = require('express');
const router = express.Router();
const RequestsController = require('../controllers/requestsController');
const { authenticateUser } = require('../middleware/auth');

// Create property request
router.post('/requests', RequestsController.createRequest);

// Get all property requests
router.get('/api/requests', RequestsController.getAllRequests);

// Get matching requests for user
router.post('/user/matching-requests', authenticateUser, RequestsController.getMatchingRequests);

// Get request by ID
router.get('/api/requests/:id', RequestsController.getRequestById);

// Update request
router.put('/api/requests/:id', authenticateUser, RequestsController.updateRequest);

// Delete request
router.delete('/api/requests/:id', authenticateUser, RequestsController.deleteRequest);

module.exports = router;