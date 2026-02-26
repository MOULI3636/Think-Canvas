const User = require('../models/User');

const userController = {
  // Get profile
  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select('-__v');
      res.json(user);
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  },

  // Update profile
  updateProfile: async (req, res) => {
    try {
      const { name, phoneNumber, bio } = req.body;
      
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { 
          name: name || req.user.name,
          phoneNumber: phoneNumber || req.user.phoneNumber,
          bio: bio || req.user.bio,
          lastActive: Date.now()
        },
        { new: true }
      ).select('-__v');

      res.json(user);
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  },

  // Get user by ID
  getUserById: async (req, res) => {
    try {
      const { userId } = req.params;
      
      const user = await User.findById(userId)
        .select('name email avatar lastActive');

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  },

  // Get online users in room
  getRoomUsers: async (req, res) => {
    try {
      const { roomId } = req.params;
      
      // This will be populated via socket
      res.json({ message: 'Use socket for real-time user list' });
    } catch (error) {
      console.error('Error fetching room users:', error);
      res.status(500).json({ error: 'Failed to fetch room users' });
    }
  }
};

module.exports = userController;