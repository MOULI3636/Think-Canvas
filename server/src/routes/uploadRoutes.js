const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { ensureAuth } = require('../middleware/authMiddleware');
const WhiteboardSession = require('../models/WhiteboardSession');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and text files are allowed'));
    }
  }
});

// @desc    Upload chat file
// @route   POST /api/upload/chat-file
router.post('/chat-file', ensureAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Here you would upload to cloud storage (Cloudinary, AWS S3, etc.)
    // For now, we'll return a mock URL
    const fileUrl = `/uploads/${Date.now()}-${req.file.originalname}`;
    
    res.json({
      success: true,
      fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// @desc    Upload whiteboard snapshot
// @route   POST /api/upload/whiteboard-snapshot
router.post('/whiteboard-snapshot', ensureAuth, upload.single('snapshot'), async (req, res) => {
  try {
    const { roomId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No snapshot uploaded' });
    }

    // Here you would upload to cloud storage
    const snapshotUrl = `/snapshots/${Date.now()}-snapshot.png`;
    
    // Save snapshot reference to whiteboard session
    const session = await WhiteboardSession.create({
      roomId,
      canvasData: {},
      createdBy: req.user._id,
      snapshot: snapshotUrl
    });

    res.json({
      success: true,
      snapshotUrl,
      sessionId: session._id
    });
  } catch (error) {
    console.error('Error uploading snapshot:', error);
    res.status(500).json({ error: 'Failed to upload snapshot' });
  }
});

module.exports = router;