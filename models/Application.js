const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Job', // Relates specifically to the Job collection
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Relates specifically to the User collection
    },
    resume: { 
      type: String, // String to hold a URL link to a PDF or cloud storage
      required: true 
    }, 
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'rejected'],
      default: 'applied',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Application', applicationSchema);
