const express = require('express');
const { upsertInterests, matchingRequests } = require('../controllers/interestController');
const router = express.Router();

router.post('/user/interests', upsertInterests);
router.post('/user/matching-requests', matchingRequests);

module.exports = router;
