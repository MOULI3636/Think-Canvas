const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/authMiddleware');
const WhiteboardSession = require('../models/WhiteboardSession');
const Room = require('../models/Room');

// @desc    Save whiteboard session
// @route   POST /api/whiteboard/save
router.post('/save', ensureAuth, async (req, res) => {
  try {
    const { roomId, canvasData, snapshot } = req.body;

    const session = await WhiteboardSession.create({
      roomId,
      canvasData,
      snapshot,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      sessionId: session._id
    });
  } catch (error) {
    console.error('Error saving whiteboard session:', error);
    res.status(500).json({ error: 'Failed to save whiteboard session' });
  }
});

// @desc    Get whiteboard sessions for a room
// @route   GET /api/whiteboard/room/:roomId
router.get('/room/:roomId', ensureAuth, async (req, res) => {
  try {
    const sessions = await WhiteboardSession.find({ roomId: req.params.roomId })
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching whiteboard sessions:', error);
    res.status(500).json({ error: 'Failed to fetch whiteboard sessions' });
  }
});

// @desc    Get specific whiteboard session
// @route   GET /api/whiteboard/:sessionId
router.get('/:sessionId', ensureAuth, async (req, res) => {
  try {
    const session = await WhiteboardSession.findById(req.params.sessionId)
      .populate('createdBy', 'name email avatar');

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Error fetching whiteboard session:', error);
    res.status(500).json({ error: 'Failed to fetch whiteboard session' });
  }
});

// @desc    Delete whiteboard session
// @route   DELETE /api/whiteboard/:sessionId
router.delete('/:sessionId', ensureAuth, async (req, res) => {
  try {
    const session = await WhiteboardSession.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Only creator can delete
    if (session.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this session' });
    }

    await session.deleteOne();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting whiteboard session:', error);
    res.status(500).json({ error: 'Failed to delete whiteboard session' });
  }
});

module.exports = router;