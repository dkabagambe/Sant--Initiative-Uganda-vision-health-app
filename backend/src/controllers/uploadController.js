const path = require('path');

// Upload file
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Return file info - for Vercel, use the full path since /tmp is not web-accessible
    // For registration, we'll store the file path and handle retrieval differently
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
    console.error('Upload error:', error);
    
    // Handle specific multer errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: 'File too large. Maximum size is 800KB. Please compress your image or use a smaller file.'
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(413).json({
        success: false,
        error: 'Too many files. Maximum 1 file allowed at a time.'
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Unexpected file field. Use "file" as field name.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to upload file',
      details: error.message
    });
  }
};

// Upload multiple files
exports.uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`,
      path: file.path
    }));

    res.json({
      success: true,
      message: 'Files uploaded successfully',
      data: uploadedFiles
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload files'
    });
  }
};
