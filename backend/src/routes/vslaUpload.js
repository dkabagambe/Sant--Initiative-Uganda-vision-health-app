const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

// VSLA multiple file upload endpoint
router.post('/documents', upload.array('files', 4), async (req, res) => {
  try {
    console.log('VSLA upload received files:', req.files?.length || 0);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    // Process uploaded files
    const uploadedFiles = req.files.map((file, index) => {
      const fileUrl = process.env.VERCEL 
        ? file.path // Use full path on Vercel
        : `/uploads/${file.filename}`; // Use relative path locally
      
      return {
        id: index + 1,
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: fileUrl,
        path: file.path,
        isVercel: !!process.env.VERCEL
      };
    });

    console.log('Successfully uploaded VSLA documents:', uploadedFiles.map(f => f.originalName));

    res.json({
      success: true,
      message: `${uploadedFiles.length} files uploaded successfully`,
      data: uploadedFiles
    });

  } catch (error) {
    console.error('VSLA upload error:', error);
    
    // Handle specific multer errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: 'File too large. Maximum size is 5MB per file. Please compress your images or use smaller files.'
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(413).json({
        success: false,
        error: 'Too many files. Maximum 4 files allowed at a time.'
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Unexpected file field. Please use "files" field name.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload files'
    });
  }
});

// Single file upload (fallback)
router.post('/single', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const fileUrl = process.env.VERCEL 
      ? req.file.path // Use full path on Vercel
      : `/uploads/${req.file.filename}`; // Use relative path locally
    
    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
        path: req.file.path,
        isVercel: !!process.env.VERCEL
      }
    });
  } catch (error) {
    console.error('Single upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
