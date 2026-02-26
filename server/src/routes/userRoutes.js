const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/authMiddleware');
const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
router.get('/profile', ensureAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-__v');
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
router.put('/profile', ensureAuth, async (req, res) => {
  try {
    const { name, phoneNumber, bio } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        name: name || req.user.name,
        phoneNumber: phoneNumber || req.user.phoneNumber,
        bio: bio || req.user.bio
      },
      { new: true }
    ).select('-__v');

    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:userId
router.get('/:userId', ensureAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('name email avatar lastActive');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;