const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/authMiddleware');
const Room = require('../models/Room');
const User = require('../models/User');
const Message = require('../models/Message');

// @desc    Create a new room
// @route   POST /api/rooms/create
router.post('/create', ensureAuth, async (req, res) => {
  try {
    const { name } = req.body;
    
    // Generate unique room ID
    let roomId;
    let isUnique = false;
    while (!isUnique) {
      roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existingRoom = await Room.findOne({ roomId });
      if (!existingRoom) isUnique = true;
    }

    const room = await Room.create({
      roomId,
      name: name || `Room-${roomId}`,
      host: req.user._id,
      participants: [{
        user: req.user._id,
        socketId: '',
        isActive: true
      }]
    });

    res.status(201).json({
      success: true,
      room: {
        ...room.toObject(),
        roomId
      }
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// @desc    Join a room
// @route   POST /api/rooms/join
// @desc    Join a room
// @route   POST /api/rooms/join
// @desc    Join a room
// @route   POST /api/rooms/join
router.post('/join', ensureAuth, async (req, res) => {
  try {
    const { roomId } = req.body;

    const room = await Room.findOne({ roomId }).populate('host', 'name email avatar');
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check if room is locked
    if (room.isLocked) {
      return res.status(403).json({ error: 'Room is locked' });
    }

    // Check if user is already in room
    const existingParticipant = room.participants.find(
      p => p.user.toString() === req.user._id.toString()
    );

    if (!existingParticipant) {
      room.participants.push({
        user: req.user._id,
        isActive: true,
        joinedAt: new Date()
      });
      await room.save();
    }

    res.json({
      success: true,
      room: {
        _id: room._id,
        roomId: room.roomId,
        name: room.name,
        host: room.host,
        isLocked: room.isLocked,
        settings: room.settings
      }
    });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ error: 'Failed to join room' });
  }
});

// @desc    Get room details
// @route   GET /api/rooms/:roomId
router.get('/:roomId', ensureAuth, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId })
      .populate('host', 'name email avatar')
      .populate('participants.user', 'name email avatar lastActive');

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

// @desc    Get room messages
// @route   GET /api/rooms/:roomId/messages
router.get('/:roomId/messages', ensureAuth, async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(messages.reverse());
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// @desc    Update room settings
// @route   PUT /api/rooms/:roomId/settings
router.put('/:roomId/settings', ensureAuth, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Only host can update settings
    if (room.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only host can update settings' });
    }

    room.settings = { ...room.settings, ...req.body };
    await room.save();

    res.json({ success: true, settings: room.settings });
  } catch (error) {
    console.error('Error updating room settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// @desc    Toggle room lock
// @route   PUT /api/rooms/:roomId/lock
router.put('/:roomId/lock', ensureAuth, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only host can lock/unlock room' });
    }

    room.isLocked = req.body.isLocked;
    await room.save();

    res.json({ success: true, isLocked: room.isLocked });
  } catch (error) {
    console.error('Error toggling room lock:', error);
    res.status(500).json({ error: 'Failed to toggle room lock' });
  }
});

// @desc    Remove participant from room
// @route   DELETE /api/rooms/:roomId/participants/:userId
router.delete('/:roomId/participants/:userId', ensureAuth, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only host can remove participants' });
    }

    room.participants = room.participants.filter(
      p => p.user.toString() !== req.params.userId
    );
    await room.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing participant:', error);
    res.status(500).json({ error: 'Failed to remove participant' });
  }
});

// @desc    Leave room
// @route   DELETE /api/rooms/:roomId/leave
router.delete('/:roomId/leave', ensureAuth, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    room.participants = room.participants.filter(
      p => p.user.toString() !== req.user._id.toString()
    );
    await room.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Error leaving room:', error);
    res.status(500).json({ error: 'Failed to leave room' });
  }
});

module.exports = router;