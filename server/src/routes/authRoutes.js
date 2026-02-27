const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { ensureGuest } = require('../middleware/authMiddleware');
const User = require('../models/User');

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  phoneNumber: user.phoneNumber,
  bio: user.bio,
  provider: user.provider,
  createdAt: user.createdAt
});

router.post('/signup', ensureGuest, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email: trimmedEmail }).select('+password');
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered. Please login.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      password: hashedPassword,
      provider: 'local'
    });

    req.login(user, (loginError) => {
      if (loginError) {
        return res.status(500).json({ error: 'Account created but login failed' });
      }
      return res.status(201).json(sanitizeUser(user));
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to sign up' });
  }
});

router.post('/login', ensureGuest, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: trimmedEmail }).select('+password');

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    req.login(user, (loginError) => {
      if (loginError) {
        return res.status(500).json({ error: 'Login failed' });
      }
      return res.json(sanitizeUser(user));
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  prompt: 'select_account'
}));

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`,
    successRedirect: process.env.CLIENT_URL,
    failureMessage: true
  })
);

router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        return res.status(500).json({ error: 'Session destruction failed' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });
});

router.get('/user', (req, res) => {
  if (req.user) {
    res.json(sanitizeUser(req.user));
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

router.get('/status', (req, res) => {
  res.json({
    isAuthenticated: req.isAuthenticated(),
    user: req.user ? sanitizeUser(req.user) : null
  });
});

module.exports = router;
