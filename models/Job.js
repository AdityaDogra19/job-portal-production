const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    salary: { type: Number, required: true },
    
    // Tracks live incoming applicants scalably!
    applicantCount: { type: Number, default: 0 },
    
    createdBy: {
      type: mongoose.Schema.Types.ObjectId, // This stores the Mongo ID of the User
      required: true,
      ref: 'User', // This tells Mongoose: "This ID belongs to the User collection"
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
