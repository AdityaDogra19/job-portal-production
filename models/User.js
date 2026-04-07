const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true, // Prevents duplicate emails
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['applicant', 'admin'],
      default: 'applicant', // Default role is applicant
    },
    resume: {
      type: String, // Permanently stores the Cloudinary URL
      default: ''
    }
  },
  {
    timestamps: true,
  }
);

// Mongoose "pre-save" hook: Runs automatically before saving a user instance
userSchema.pre('save', async function () {
  // If the password hasn't been changed, skip the hashing logic
  if (!this.isModified('password')) {
    return;
  }

  // Generate a random 'salt' (costs 10 processing rounds)
  const salt = await bcrypt.genSalt(10);
  
  // Hash the password merged with the salt, and inject it back into the model instance
  this.password = await bcrypt.hash(this.password, salt);
});

// Helper method appended to the User model to compare plain text vs hashed database password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
