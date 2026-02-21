const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const uploadController = require('../controllers/uploadController');

// Single file upload
router.post('/single', upload.single('file'), uploadController.uploadFile);

// Multiple files upload
router.post('/multiple', upload.array('files', 5), uploadController.uploadMultipleFiles);

module.exports = router;
