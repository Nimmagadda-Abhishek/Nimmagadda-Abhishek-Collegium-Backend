const express = require('express');
const { signup, login, getProfile, verifyToken } = require('../controllers/authController');

const router = express.Router();

// Signup route
router.post('/signup', signup);

// Login route
router.post('/login', login);

// Get user profile (protected route)
router.get('/profile', verifyToken, getProfile);

module.exports = router;
