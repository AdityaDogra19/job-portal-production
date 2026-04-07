const cloudinary = require('cloudinary').v2;

// Cloudinary needs these credentials to know which account to upload to.
// We keep them safe in our .env file!
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
