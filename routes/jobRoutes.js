const express = require('express');
const router = express.Router();
const {
  postJob,
  viewApplicants,
  viewJobs,
  getJobById,
  applyToJob,
  getMyApplications,
  recommendJobs
} = require('../controllers/jobController');

const { checkAuth, checkRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// -----------------------------------------------------------
// Important Routing Rule: 
// Specific paths (like '/my-applications') MUST come before 
// dynamic parameters (like '/:id'). Otherwise, express thinks 
// "my-applications" is an ID!
// -----------------------------------------------------------

// Ask the recommendation algorithm for jobs suited to skills
router.post('/recommendations', checkAuth, recommendJobs);

// Get logged in user's applications (Applicant only)
router.get('/my-applications', checkAuth, checkRole('applicant'), getMyApplications);

// View all jobs (Publicly available, no auth required)
router.get('/', viewJobs);

// View a single job by ID (Publicly available)
router.get('/:id', getJobById);


// -----------------------------------------------------------
// Protected Routes
// -----------------------------------------------------------

// Post a new job (ADMIN ONLY)
router.post('/', checkAuth, checkRole('admin'), postJob);

// View applicants for a specific job (ADMIN ONLY)
router.get('/:id/applicants', checkAuth, checkRole('admin'), viewApplicants);

// Apply to a job (APPLICANT ONLY)
// We removed upload.single() here because the user now uploads the resume to /api/upload-resume first!
router.post('/:id/apply', checkAuth, checkRole('applicant'), applyToJob);

module.exports = router;
