const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/adminController');

// Import our Bouncer and VIP Manager!
const { checkAuth, checkRole } = require('../middlewares/authMiddleware');

// Route: /api/admin/dashboard
// 👉 Only admin can access
router.get('/dashboard', checkAuth, checkRole('admin'), getDashboardStats);

module.exports = router;
