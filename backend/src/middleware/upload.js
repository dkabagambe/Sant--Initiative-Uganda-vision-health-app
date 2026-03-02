const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

// On Vercel the filesystem is read-only except /tmp; use /tmp for uploads there
const getUploadsDir = () => {
  const uploadsDir = process.env.VERCEL
    ? path.join(os.tmpdir(), 'sante-uploads')
    : path.join(__dirname, '../../uploads');

  // Only create directory if not on Vercel (Vercel uses /tmp which already exists)
  if (!process.env.VERCEL && !fs.existsSync(uploadsDir)) {
    try {
      fs.mkdirSync(uploadsDir, { recursive: true });
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
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

module.exports = upload;
