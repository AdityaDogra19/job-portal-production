const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// 1. Configure where the files should go (Cloudinary Storage)
let storage;

if (process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
  // If keys aren't set yet, fallback to a mock local storage so we can test the API without crashing!
  const fs = require('fs');
  if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');
  
  storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
  });
} else {
  // If real keys exist, use Cloudinary!
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'job_portal_resumes',
      allowed_formats: ['pdf'],
    },
  });
}

// 2. Create a Multer Filter to stop bad files before they even reach Cloudinary
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Only PDF files are allowed!'), false); // Reject the file
  }
};

// 3. Initialize Multer with our storage and filter rules
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // Enforce exact 2MB size limit
});

module.exports = upload;
