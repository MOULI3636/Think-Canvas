const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    default: 'Untitled Room'
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    socketId: String,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  isLocked: {
    type: Boolean,
    default: false
  },
  settings: {
    allowChat: {
      type: Boolean,
      default: true
    },
    allowFileUpload: {
      type: Boolean,
      default: true
    },
    allowDrawing: {
      type: Boolean,
      default: true
    }
  },
  whiteboardData: {
    type: Object,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  endedAt: Date
});

// Generate unique room ID
roomSchema.statics.generateRoomId = function() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

module.exports = mongoose.model('Room', roomSchema);