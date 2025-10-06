const express = require('express');
const { serveUploadFile } = require('../controllers/fileController');
const router = express.Router();

router.get('/api/images/:folderName/:imageName', serveUploadFile);

module.exports = router;
