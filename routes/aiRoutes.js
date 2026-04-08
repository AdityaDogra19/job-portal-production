const express = require('express');
const router = express.Router();
const { analyzeResume, matchJobs, generatePitch, skillGapAnalyzer } = require('../controllers/aiController');
const { checkAuth } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// @route   POST /api/ai/analyze-resume
router.post('/analyze-resume', checkAuth, upload.single('resume'), analyzeResume);

// @route   POST /api/ai/job-match
router.post('/job-match', checkAuth, matchJobs);

// @route   POST /api/ai/generate-pitch
// Uses Multer to catch the newly uploaded resume to generate a custom pitch!
router.post('/generate-pitch', checkAuth, upload.single('resume'), generatePitch);

// @route   POST /api/ai/skill-gap
router.post('/skill-gap', checkAuth, upload.single('resume'), skillGapAnalyzer);

module.exports = router;
