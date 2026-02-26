const User = require('../models/User');

const authController = {
  // Get current user
  getCurrentUser: (req, res) => {
    if (req.user) {
      res.json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
        phoneNumber: req.user.phoneNumber,
        bio: req.user.bio,
        provider: req.user.provider,
        createdAt: req.user.createdAt,
        lastActive: req.user.lastActive
      });
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  },

  // Logout
  logout: (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: 'Session destruction failed' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
      });
    });
  },

  // Check auth status
  checkStatus: (req, res) => {
    res.json({ 
      isAuthenticated: req.isAuthenticated(),
      user: req.user || null
    });
  },

  // Google auth redirect
  googleAuth: passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  }),

  // Google auth callback
  googleCallback: passport.authenticate('google', { 
    failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`,
    successRedirect: process.env.CLIENT_URL,
    failureMessage: true
  })
};

module.exports = authController;