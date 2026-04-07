const express = require('express');
const router = express.Router();

const { analyzeResume } = require('../controllers/resumeController');
const { checkAuth } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// @route   POST /api/resume/analyze
// @desc    Upload a PDF and retrieve AI feedback
// We use checkAuth so you know WHO is uploading, and upload.single to securely stage the PDF
router.post('/analyze', checkAuth, upload.single('resume'), analyzeResume);

module.exports = router;
