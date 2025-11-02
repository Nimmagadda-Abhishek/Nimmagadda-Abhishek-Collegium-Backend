const express = require('express');
const { signup, login, getProfile, searchUsers, verifyToken } = require('../controllers/authController');

const router = express.Router();

// Signup route
router.post('/signup', signup);

// Login route
router.post('/login', login);

// Get user profile (protected route)
router.get('/profile', verifyToken, getProfile);

// Search users (protected route)
router.get('/search', verifyToken, searchUsers);

// Get approved colleges for signup
router.get('/colleges', async (req, res) => {
  try {
    const CollegeAdmin = require('../models/CollegeAdmin');
    const colleges = await CollegeAdmin.find({ isApproved: true }).select('_id collegeName');
    res.status(200).json({ colleges });
  } catch (error) {
    console.error('Get colleges error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
