const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/authController');
const { checkAuth } = require('../middlewares/authMiddleware');

// Using standard RESTful pathing definitions
router.post('/register', registerUser);
router.post('/login', loginUser);

// Profile Fetching (Requires JWT Wristband to fetch their personal record!)
router.get('/me', checkAuth, getUserProfile);

module.exports = router;
