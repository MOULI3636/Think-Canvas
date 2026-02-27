const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    minlength: 6,
    select: false,
    default: null
  },
  avatar: {
    type: String,
    default: ''
  },
  phoneNumber: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  provider: {
    type: String,
    enum: ['google', 'local'],
    default: 'google'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', function(next) {
  this.lastActive = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
