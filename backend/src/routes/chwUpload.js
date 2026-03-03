const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

// CHW-specific upload configuration with 15MB limit
const getCHWUploadsDir = () => {
  const uploadsDir = process.env.VERCEL
    ? path.join(os.tmpdir(), 'sante-chw-uploads')
    : path.join(__dirname, '../../uploads/chw');

  if (!fs.existsSync(uploadsDir)) {
    try {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log(`✅ Created CHW uploads directory: ${uploadsDir}`);
    } catch (err) {
      console.warn('CHW uploads dir not created (may be read-only):', err.message);
    }
  }

  return uploadsDir;
};

// Configure storage for CHW uploads
const chwStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getCHWUploadsDir());
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, `chw-${nameWithoutExt}-${uniqueSuffix}${ext}`);
  }
});

// File filter - allow images and PDFs for CHW documents
const chwFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and PDF files are allowed for CHW registration.'), false);
  }
};

// Configure multer for CHW uploads with 15MB limit
const chwUpload = multer({
  storage: chwStorage,
  fileFilter: chwFileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit for CHW documents
    fieldSize: 2 * 1024 * 1024, // 2MB for form fields
    files: 3 // Allow up to 3 files (certificates, etc.)
  }
});

// CHW multiple file upload endpoint
router.post('/documents', chwUpload.array('files', 3), async (req, res) => {
  try {
    console.log('CHW upload received files:', req.files?.length || 0);
    
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
        : `/uploads/chw/${file.filename}`; // Use relative path locally
      
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

    console.log('Successfully uploaded CHW documents:', uploadedFiles.map(f => `${f.originalName} (${Math.round(f.size/1024/1024)}MB)`));

    res.json({
      success: true,
      message: `${uploadedFiles.length} CHW files uploaded successfully`,
      data: uploadedFiles
    });

  } catch (error) {
    console.error('CHW upload error:', error);
    
    // Handle specific multer errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: 'File too large. Maximum size is 15MB per file for CHW documents. Please compress your file or use a smaller one.'
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(413).json({
        success: false,
        error: 'Too many files. Maximum 3 files allowed at a time for CHW registration.'
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
      error: error.message || 'Failed to upload CHW files'
    });
  }
});

// CHW single file upload endpoint
router.post('/single', chwUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const fileUrl = process.env.VERCEL 
      ? req.file.path // Use full path on Vercel
      : `/uploads/chw/${req.file.filename}`; // Use relative path locally
    
    console.log(`CHW single file uploaded: ${req.file.originalname} (${Math.round(req.file.size/1024/1024)}MB)`);
    
    res.json({
      success: true,
      message: 'CHW file uploaded successfully',
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
    console.error('CHW single upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
