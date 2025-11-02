const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const CollegeAdmin = require('../models/CollegeAdmin');
const College = require('../models/College');
const Profile = require('../models/Profile');

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify college admin JWT token and check approval
const verifyCollegeAdminToken = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.adminId) {
      return res.status(401).json({ error: 'Invalid token for college admin.' });
    }

    // Check if admin is approved
    const admin = await CollegeAdmin.findById(decoded.adminId);
    if (!admin || !admin.isApproved) {
      return res.status(403).json({ error: 'College admin not approved yet.' });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// Register a new college admin
const register = async (req, res) => {
  try {
    const { collegeName, email, password, confirmPassword } = req.body;

    if (!collegeName || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Check if admin already exists
    const existingAdmin = await CollegeAdmin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: 'College admin with this email already exists' });
    }

    // Find or create college
    let college = await College.findOne({ collegeName });
    if (!college) {
      college = new College({
        collegeName,
        domain: email.split('@')[1], // Extract domain from email
        collegeId: collegeName.toLowerCase().replace(/\s+/g, '-'), // Generate collegeId
      });
      await college.save();
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const admin = new CollegeAdmin({
      collegeId: college._id,
      email,
      password: hashedPassword,
    });

    await admin.save();
    res.status(201).json({ message: 'College admin registered successfully' });
  } catch (error) {
    console.error('Register college admin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login college admin
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find admin
    const admin = await CollegeAdmin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ adminId: admin._id, collegeId: admin.collegeId }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'Login successful',
      admin: {
        id: admin._id,
        collegeId: admin.collegeId,
        email: admin.email,
      },
      token,
    });
  } catch (error) {
    console.error('Login college admin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get users of the specified college (defaults to authenticated user's college)
const getUsers = async (req, res) => {
  try {
    let { collegeId } = req.query;
    if (!collegeId) {
      collegeId = req.user.collegeId;
    } else {
      // Ensure the requested collegeId matches the user's college for security
      if (collegeId !== req.user.collegeId.toString()) {
        return res.status(403).json({ error: 'Access denied. You can only view users from your own college.' });
      }
    }

    // Find profiles where the associated user's collegeId matches
    const profiles = await Profile.find().populate({
      path: 'user',
      match: { collegeId },
    });

    // Filter out profiles where user is null (due to match)
    const filteredProfiles = profiles.filter(profile => profile.user);

    // Map to the required format
    const users = filteredProfiles.map(profile => ({
      name: profile.user.fullName,
      email: profile.user.email,
      department: profile.branch,
      year: profile.year,
      status: 'active', // Placeholder as no status field exists
      profileImage: profile.profileImage,
    }));

    res.status(200).json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  register,
  login,
  verifyCollegeAdminToken,
  getUsers,
};
