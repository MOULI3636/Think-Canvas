module.exports = {
  // Ensure user is authenticated
  ensureAuth: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ error: 'Not authenticated' });
  },
  
  // Ensure user is not authenticated
  ensureGuest: (req, res, next) => {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.status(403).json({ error: 'Already authenticated' });
  },

  // Optional auth - doesn't error if not authenticated
  optionalAuth: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    next();
  }
};