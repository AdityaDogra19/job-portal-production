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

// @route   GET /api/admin/applications
// @desc    Get all applications platform-wide
const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('userId', 'name email')
      .populate('jobId', 'title company')
      .sort({ createdAt: -1 });
    res.status(200).json({ applications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/admin/applications/:id/status
// @desc    Admin updates application tracking status
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status input natively
    if (!['applied', 'shortlisted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status type' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    
    // Mutate the status
    application.status = status;
    await application.save();

    // Fire off an automated DB notification to the applicant
    const Notification = require('../models/Notification');
    await Notification.create({
      userId: application.userId,
      type: 'application_status',
      message: `Your application status has been updated to: ${status}`,
      relatedData: { applicationId: application._id, jobId: application.jobId }
    });

    res.status(200).json({ message: 'Status updated successfully', application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats, updateApplicationStatus, getAllApplications };
