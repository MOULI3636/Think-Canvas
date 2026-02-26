const cloudinary = require('cloudinary').v2;
const WhiteboardSession = require('../models/WhiteboardSession');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadController = {
  // Upload file to chat
  uploadChatFile: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Convert buffer to base64
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'thinkcanvas/chat',
        resource_type: 'auto'
      });

      res.json({
        success: true,
        fileUrl: result.secure_url,
        publicId: result.public_id,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype
      });
    } catch (error) {
      console.error('Upload chat file error:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  },

  // Upload whiteboard snapshot
  uploadSnapshot: async (req, res) => {
    try {
      const { roomId } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: 'No snapshot uploaded' });
      }

      // Convert buffer to base64
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'thinkcanvas/snapshots',
        resource_type: 'image'
      });

      // Create session
      const session = await WhiteboardSession.create({
        roomId,
        canvasData: {},
        createdBy: req.user._id,
        snapshot: result.secure_url
      });

      res.json({
        success: true,
        snapshotUrl: result.secure_url,
        sessionId: session._id
      });
    } catch (error) {
      console.error('Upload snapshot error:', error);
      res.status(500).json({ error: 'Failed to upload snapshot' });
    }
  },

  // Delete file
  deleteFile: async (req, res) => {
    try {
      const { publicId } = req.params;

      const result = await cloudinary.uploader.destroy(publicId);

      res.json({ success: true, result });
    } catch (error) {
      console.error('Delete file error:', error);
      res.status(500).json({ error: 'Failed to delete file' });
    }
  }
};

module.exports = uploadController;