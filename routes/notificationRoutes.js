const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const { checkAuth } = require('../middlewares/authMiddleware');

router.get('/', checkAuth, getNotifications);
router.put('/read', checkAuth, markAsRead);

module.exports = router;
