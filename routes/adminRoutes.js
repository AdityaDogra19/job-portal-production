const express = require('express');
const router = express.Router();
const { getDashboardStats, updateApplicationStatus, getAllApplications } = require('../controllers/adminController');

// Import our Bouncer and VIP Manager!
const { checkAuth, checkRole } = require('../middlewares/authMiddleware');

// Route: /api/admin/dashboard
// 👉 Only admin can access
router.get('/dashboard', checkAuth, checkRole('admin'), getDashboardStats);

// Route: /api/admin/applications/:id/status
router.put('/applications/:id/status', checkAuth, checkRole('admin'), updateApplicationStatus);

// Route: /api/admin/applications
router.get('/applications', checkAuth, checkRole('admin'), getAllApplications);

module.exports = router;
