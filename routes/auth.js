const express = require('express');
const { signup, login, getProfile, searchUsers, getAllStudents, getUserById, verifyToken, deleteAccount, blockUser, unblockUser } = require('../controllers/authController');

const router = express.Router();

// Signup route
router.post('/signup', signup);

// Login route
router.post('/login', login);

// Get user profile (protected route)
router.get('/profile', verifyToken, getProfile);

// Search users (protected route)
router.get('/search', verifyToken, searchUsers);

// Get all students (protected route)
router.get('/students', verifyToken, getAllStudents);

// Get user by ID (protected route)
router.get('/:userId', verifyToken, getUserById);

// Delete account (protected route)
router.delete('/delete-account', verifyToken, deleteAccount);

// Block user (protected route)
router.post('/block/:userId', verifyToken, blockUser);

// Unblock user (protected route)
router.post('/unblock/:userId', verifyToken, unblockUser);

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
