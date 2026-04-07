const jwt = require('jsonwebtoken');

// Middleware 1: checkAuth - Validates if the user is logged in
const checkAuth = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Attach the decoded data (contains id and role)
      req.user = decoded;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// Middleware 2: checkRole - Validates if the logged-in user has the right permissions
const checkRole = (...roles) => {
  return (req, res, next) => {
    // If the user's role is not inside the roles array that we passed, block them
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Forbidden: You do not have permission. Allowed roles: ${roles.join(', ')}` 
      });
    }
    // Otherwise, let them through
    next();
  };
};

module.exports = { checkAuth, checkRole };
