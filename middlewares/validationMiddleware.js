const { validationResult } = require('express-validator');

// Centralized validation middleware function
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return early formatting first error clearly
    return res.status(400).json({ 
      message: errors.array()[0].msg, 
      errors: errors.array() 
    });
  }
  next();
};

module.exports = { validateRequest };
