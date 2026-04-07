const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper function to generate a JWT token
const generateToken = (id, role) => {
  // Packages the id and role into a cryptographically signed unmodifiable string
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d', // the token will expire in 30 days
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Create the user in the database (Password will be hashed automatically by our User Model hook!)
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    // 3. Return user data and their generated JWT token
    if (user) {
      res.status(201).json({
        message: 'Registration successful',
        user: { _id: user._id, name: user.name, email: user.email, role: user.role },
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data received' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/auth/login
// @desc    Authenticate User & get token
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the user by their email
    const user = await User.findOne({ email });

    // 2. Check if the user exists AND if the submitted password matches the database hashed setup
    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        message: 'Login successful',
        user: { _id: user._id, name: user.name, email: user.email, role: user.role },
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @route   GET /api/auth/me
// @desc    Get user profile data (and their active resume link!)
const getUserProfile = async (req, res) => {
  try {
    // We use .select('-password') to ensure we NEVER send the hashed password to the frontend UI!
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getUserProfile };
