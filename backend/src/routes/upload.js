const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const uploadController = require('../controllers/uploadController');

// Catch GET requests and return proper error
router.get('/single', (req, res) => {
  res.status(405).json({
    success: false,
    error: 'Method not allowed. Use POST for file uploads.',
    correct_method: 'POST'
  });
});

// Single file upload
router.post('/single', upload.single('file'), uploadController.uploadFile);

// Multiple files upload
router.post('/multiple', upload.array('files', 5), uploadController.uploadMultipleFiles);

module.exports = router;
