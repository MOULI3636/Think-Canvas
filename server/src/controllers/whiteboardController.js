const WhiteboardSession = require('../models/WhiteboardSession');
const Room = require('../models/Room');

const whiteboardController = {
  // Save whiteboard session
  saveSession: async (req, res) => {
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
        session
      });
    } catch (error) {
      console.error('Error saving session:', error);
      res.status(500).json({ error: 'Failed to save session' });
    }
  },

  // Get sessions by room
  getRoomSessions: async (req, res) => {
    try {
      const { roomId } = req.params;
      
      const sessions = await WhiteboardSession.find({ roomId })
        .populate('createdBy', 'name email avatar')
        .sort({ createdAt: -1 });

      res.json(sessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  },

  // Get single session
  getSession: async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      const session = await WhiteboardSession.findById(sessionId)
        .populate('createdBy', 'name email avatar');

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      res.json(session);
    } catch (error) {
      console.error('Error fetching session:', error);
      res.status(500).json({ error: 'Failed to fetch session' });
    }
  },

  // Delete session
  deleteSession: async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      const session = await WhiteboardSession.findById(sessionId);

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Check if user is creator or room host
      const room = await Room.findOne({ roomId: session.roomId });
      
      if (session.createdBy.toString() !== req.user._id.toString() && 
          room.host.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      await session.deleteOne();
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting session:', error);
      res.status(500).json({ error: 'Failed to delete session' });
    }
  }
};

module.exports = whiteboardController;