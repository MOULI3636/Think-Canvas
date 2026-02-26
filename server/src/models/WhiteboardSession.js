const mongoose = require('mongoose');

const whiteboardSessionSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    index: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  canvasData: {
    type: Object,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  snapshot: {
    type: String, // URL to snapshot image
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WhiteboardSession', whiteboardSessionSchema);