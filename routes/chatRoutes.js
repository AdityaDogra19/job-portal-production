const express = require('express');
const router = express.Router();
const { getChatHistory } = require('../controllers/chatController');
const { checkAuth } = require('../middlewares/authMiddleware');

// Fetch historical messages securely
router.get('/:otherUserId', checkAuth, getChatHistory);

module.exports = router;
