const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Configure storage for large files with compression
const getUploadsDir = () => {
  const uploadsDir = process.env.VERCEL
    ? path.join(os.tmpdir(), 'sante-uploads')
    : path.join(__dirname, '../../uploads');

  if (!fs.existsSync(uploadsDir)) {
    try {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log(`✅ Created uploads directory: ${uploadsDir}`);
    } catch (err) {
      console.warn('Uploads dir not created:', err.message);
    }
  }
  return uploadsDir;
};

// Configure storage with smaller limits to avoid Vercel limits
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getUploadsDir());
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'), false);
  }
};

// Configure with Vercel-friendly limits
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB per file (under Vercel limits)
    fieldSize: 1 * 1024 * 1024, // 1MB for form fields
    files: 2 // Max 2 files
  }
});

// Single file upload endpoint
router.post('/single', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const fileUrl = process.env.VERCEL 
      ? req.file.path 
      : `/uploads/${req.file.filename}`;
    
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
    res.status(500).json({
      success: false,
      error: 'Failed to upload file'
    });
  }
});

module.exports = router;
