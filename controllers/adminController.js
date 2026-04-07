const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

// @route   GET /api/admin/dashboard
// @desc    Get aggregate data for the Admin UI
const getDashboardStats = async (req, res) => {
  try {
    // We execute these three MongoDB queries concurrently (at the exact same time) 
    // using Promise.all to make this dashboard load extremely fast!
    const [totalUsers, totalJobs, totalApplications] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments()
    ]);

    res.status(200).json({
      message: 'Welcome to the Admin Dashboard',
      stats: {
        totalUsers,
        totalJobs,
        totalApplications
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
