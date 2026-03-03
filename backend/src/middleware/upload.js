const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

// On Vercel the filesystem is read-only except /tmp; use /tmp for uploads there
const getUploadsDir = () => {
  const uploadsDir = process.env.VERCEL
    ? path.join(os.tmpdir(), 'sante-uploads')
    : path.join(__dirname, '../../uploads');

  // Create directory if it doesn't exist (both local and Vercel)
  if (!fs.existsSync(uploadsDir)) {
    try {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log(`✅ Created uploads directory: ${uploadsDir}`);
    } catch (err) {
      console.warn('Uploads dir not created (may be read-only):', err.message);
    }
  }

  return uploadsDir;
};

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getUploadsDir());
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
  }
});

// File filter - only allow images and PDFs
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1.5 * 1024 * 1024, // 1.5MB limit (well under Vercel 4.5MB limit)
    fieldSize: 300 * 1024, // 300KB for form fields
    files: 2 // Allow 2 files for outlet registration (shop front + owner ID)
  }
});

module.exports = upload;
