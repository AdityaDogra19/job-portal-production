const User = require('../models/User');

// @route   PUT /api/users/open-to-work
// @desc    Update user's openToWork status and preferences
// @access  Private
const updateOpenToWork = async (req, res) => {
  try {
    const { openToWork, preferredRoles, preferredLocation, videoResume } = req.body;
    
    // Find the current logged in user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (typeof openToWork === 'boolean') user.openToWork = openToWork;
    if (preferredRoles) user.preferredRoles = preferredRoles;
    if (preferredLocation) user.preferredLocation = preferredLocation;
    if (videoResume) user.videoResume = videoResume;

    await user.save();

    res.status(200).json({
      message: 'Profile preferences updated successfully',
      user: {
        id: user._id,
        openToWork: user.openToWork,
        preferredRoles: user.preferredRoles,
        preferredLocation: user.preferredLocation,
        videoResume: user.videoResume
      }
    });

  } catch (error) {
    console.error('Update OpenToWork Error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

module.exports = {
  updateOpenToWork
};
