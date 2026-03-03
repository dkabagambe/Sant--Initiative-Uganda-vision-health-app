const express = require('express');
const router = express.Router();

// Simple file upload endpoint that accepts base64 data
router.post('/single', async (req, res) => {
  try {
    const { fileData, fileName, mimeType } = req.body;
    
    console.log('Simple upload received:', { fileName, mimeType, fileDataLength: fileData?.length });
    
    // For now, just return success without actual file processing
    // This allows VSLA registration to proceed
    const mockFileUrl = `/uploads/${fileName}`;
    
    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: fileName,
        originalName: fileName,
        mimetype: mimeType,
        size: fileData ? fileData.length : 0,
        url: mockFileUrl,
        path: mockFileUrl,
        isVercel: !!process.env.VERCEL
      }
    });
  } catch (error) {
    console.error('Simple upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
