const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const { checkAuth } = require('../middlewares/authMiddleware');

const User = require('../models/User');

// @route   POST /api/upload-resume
// @desc    Upload a resume to Cloudinary and get the live URL back
//          (Used explicitly for two-step Frontend Apply flows)
router.post('/', checkAuth, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF resume' });
    }
    
    // --- FEATURE: Save Resume to Profile ---
    // We instantly find the logged-in User and permanently save their new Cloudinary link
    await User.findByIdAndUpdate(req.user.id, { resume: req.file.path });

    // Returns exactly the JSON structure your Frontend Lesson requested!
    res.status(200).json({
      resumeUrl: req.file.path,
      message: 'Resume safely uploaded and saved to your profile!'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
