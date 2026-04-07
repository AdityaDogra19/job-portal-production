const express = require('express');
const router = express.Router();

// Import our Bouncer Middleware (we named it checkAuth, but we assign it to verifyToken here for clarity!)
const { checkAuth: verifyToken } = require('../middlewares/authMiddleware');
const { getTestMessage } = require('../controllers/testController');

// @route   GET /api/test
// @desc    Basic test route
// @access  Public
router.get('/test', getTestMessage);

// @route   GET /api/protected
// @desc    Verify JWT Middleware functionality
router.get('/protected', verifyToken, (req, res) => {
  res.json({ 
    message: "You are authorized",
    user_id_from_token: req.user.id // This is dynamically injected by our verifyToken middleware!
  });
});

module.exports = router;
