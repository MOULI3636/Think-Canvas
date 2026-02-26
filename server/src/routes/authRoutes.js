const express = require('express');
const passport = require('passport');
const router = express.Router();
const { ensureAuth, ensureGuest } = require('../middleware/authMiddleware');

// @desc    Auth with Google
// @route   GET /api/auth/google
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'],
  prompt: 'select_account'
}));

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`,
    successRedirect: process.env.CLIENT_URL,
    failureMessage: true
  })
);

// @desc    Logout user
// @route   GET /api/auth/logout
router.get('/logout', (req, res) => {
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
});

// @desc    Get current user
// @route   GET /api/auth/user
router.get('/user', (req, res) => {
  if (req.user) {
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      phoneNumber: req.user.phoneNumber,
      bio: req.user.bio,
      provider: req.user.provider,
      createdAt: req.user.createdAt
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// @desc    Check auth status
// @route   GET /api/auth/status
router.get('/status', (req, res) => {
  res.json({ 
    isAuthenticated: req.isAuthenticated(),
    user: req.user || null
  });
});

module.exports = router;