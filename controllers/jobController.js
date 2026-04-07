const Job = require('../models/Job');
const Application = require('../models/Application');

// --- Admin Actions ---

// @route   POST /api/jobs
// @desc    Post a new job
const postJob = async (req, res) => {
  try {
    const { title, description, company, location, salary } = req.body;
    
    const job = await Job.create({
      title,
      description,
      company,
      location,
      salary,
      createdBy: req.user.id // Pulled directly from the JWT verification in checkAuth!
    });

    res.status(201).json({ message: 'Job created successfully', job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/jobs/:id/applicants
// @desc    View all applicants for a specific job
const viewApplicants = async (req, res) => {
  try {
    // 1. Find all applications where the jobId matches the parameter.
    // 2. 'populate' is magic: Instead of just returning the userId number, 
    // it automatically fetches that user's name and email from the User collection!
    const applications = await Application.find({ jobId: req.params.id })
      .populate('userId', 'name email');
      
    res.status(200).json({ applications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- General / Applicant Actions ---

// @route   GET /api/jobs
// @desc    View all available jobs (with search/filter querying!)
const viewJobs = async (req, res) => {
  try {
    const { keyword, location } = req.query;
    
    // Start with an empty query. If no filters are provided, this pulls all jobs!
    let query = {};

    // If a keyword exists, command MongoDB to search the title (case-insensitive)
    if (keyword) {
      query.title = { $regex: keyword, $options: 'i' }; 
    }

    // If a location filter exists, command MongoDB to search the location
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Feed our dynamically built query object directly into the database
    const jobs = await Job.find(query).populate('createdBy', 'name');
    
    res.status(200).json({ jobs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/jobs/:id
// @desc    View single job details
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('createdBy', 'name');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    res.status(200).json({ job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/jobs/:id/apply
// @desc    Apply to a specific job using a previously uploaded Resume URL
const applyToJob = async (req, res) => {
  try {
    // 1. We extract the Cloudinary URL from the JSON body instead of parsing a file!
    const { resume } = req.body;

    if (!resume) {
      return res.status(400).json({ message: 'Please provide a valid resume URL' });
    }

    // Check if user already submitted an application for this specific job
    const existingApplication = await Application.findOne({
      jobId: req.params.id,
      userId: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this job.' });
    }

    const application = await Application.create({
      jobId: req.params.id, // Uses the URL parameter exactly as designed
      userId: req.user.id,
      resume: resume // Injects the standard string URL straight from the req.body!
    });

    // --- SCALABILITY FEATURE: Live Aggregate Counting ---
    // We increment the specific Job's counter by 1. 
    // This is infinitely faster than triggering a heavy .countDocuments() query every single time someone looks at the main Job Board!
    await Job.updateOne({ _id: req.params.id }, { $inc: { applicantCount: 1 } });

    res.status(201).json({ message: 'Successfully applied!', application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/jobs/my-applications
// @desc    Get logged-in applicant's applications
const getMyApplications = async (req, res) => {
  try {
    // Fetch user's applications based on their token ID, populate job data
    const applications = await Application.find({ userId: req.user.id })
      .populate('jobId', 'title company');
      
    res.status(200).json({ applications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/jobs/recommendations
// @desc    Get system job recommendations based on user skills
const recommendJobs = async (req, res) => {
  try {
    const { skills } = req.body; // e.g., ["React", "Express", "Node.js"]
    
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ message: 'Please provide an array of skills' });
    }

    const availableJobs = await Job.find().lean(); // .lean() improves performance for pure reading
    let rankedJobs = [];

    // Normalize user skills to lowercase for matching
    const userSkillsCleaned = skills.map(skill => skill.toLowerCase());

    // --- Scoring Algorithm ---
    availableJobs.forEach(job => {
      let matchScore = 0;
      let matchedSkills = [];

      // Combine job title and description into one searchable string
      const jobDataText = (job.title + " " + job.description).toLowerCase();

      userSkillsCleaned.forEach(skill => {
        if (jobDataText.includes(skill)) {
          // Standard match in description = 10 points
          matchScore += 10; 
          matchedSkills.push(skill);
          
          // Keyword in the TITLE? Massive bonus, because it's the core job!
          if (job.title.toLowerCase().includes(skill)) {
            matchScore += 20; 
          }
        }
      });

      // Only push jobs that have at least some relevance
      if (matchScore > 0) {
        rankedJobs.push({
          jobId: job._id,
          title: job.title,
          company: job.company,
          matchedSkills: matchedSkills,
          matchScore: matchScore
        });
      }
    });

    // Rank jobs from highest score to lowest score
    rankedJobs.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      message: 'Recommendations built successfully',
      recommendations: rankedJobs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  postJob,
  viewApplicants,
  viewJobs,
  getJobById,
  applyToJob,
  getMyApplications,
  recommendJobs
};
