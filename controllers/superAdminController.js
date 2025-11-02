const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SuperAdmin = require('../models/SuperAdmin');
const CollegeAdmin = require('../models/CollegeAdmin');
const College = require('../models/College');
const User = require('../models/User');
const Event = require('../models/Event');
const Project = require('../models/Project');
const UserSubscription = require('../models/UserSubscription');

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify super admin JWT token
const verifySuperAdminToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.superAdminId) {
      return res.status(401).json({ error: 'Invalid token for super admin.' });
    }
    req.superAdmin = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// Register a new super admin (one-time setup)
const register = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Check if super admin already exists
    const existingSuperAdmin = await SuperAdmin.findOne({ email });
    if (existingSuperAdmin) {
      return res.status(400).json({ error: 'Super admin already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new super admin
    const superAdmin = new SuperAdmin({
      email,
      password: hashedPassword,
    });

    await superAdmin.save();
    res.status(201).json({ message: 'Super admin registered successfully' });
  } catch (error) {
    console.error('Register super admin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login super admin
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find super admin
    const superAdmin = await SuperAdmin.findOne({ email });
    if (!superAdmin) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, superAdmin.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ superAdminId: superAdmin._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'Login successful',
      superAdmin: {
        id: superAdmin._id,
        email: superAdmin.email,
      },
      token,
    });
  } catch (error) {
    console.error('Login super admin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all college admins
const getCollegeAdmins = async (req, res) => {
  try {
    const collegeAdmins = await CollegeAdmin.find().select('-password');
    res.status(200).json({ collegeAdmins });
  } catch (error) {
    console.error('Get college admins error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Approve or reject college admin
const approveCollegeAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { isApproved } = req.body;

    const admin = await CollegeAdmin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ error: 'College admin not found' });
    }

    admin.isApproved = isApproved;
    await admin.save();

    res.status(200).json({ message: `College admin ${isApproved ? 'approved' : 'rejected'} successfully`, admin });
  } catch (error) {
    console.error('Approve college admin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all users across colleges
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().populate('collegeId', 'collegeName');
    res.status(200).json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all events across colleges
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('createdBy', 'collegeName').populate('collegeId', 'collegeName');
    res.status(200).json({ events });
  } catch (error) {
    console.error('Get all events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all projects across colleges
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate('user', 'displayName').populate('collegeId', 'collegeName');
    res.status(200).json({ projects });
  } catch (error) {
    console.error('Get all projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all subscriptions
const getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await UserSubscription.find().populate('user', 'displayName email').populate('plan', 'name');
    res.status(200).json({ subscriptions });
  } catch (error) {
    console.error('Get all subscriptions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new college
const createCollege = async (req, res) => {
  try {
    const { collegeName, domain, collegeId } = req.body;

    if (!collegeName || !domain || !collegeId) {
      return res.status(400).json({ error: 'College name, domain, and college ID are required' });
    }

    // Check if college already exists
    const existingCollege = await College.findOne({
      $or: [
        { collegeName },
        { domain },
        { collegeId }
      ]
    });
    if (existingCollege) {
      return res.status(400).json({ error: 'College with this name, domain, or ID already exists' });
    }

    // Create new college
    const college = new College({
      collegeName,
      domain,
      collegeId,
    });

    await college.save();
    res.status(201).json({ message: 'College created successfully', college });
  } catch (error) {
    console.error('Create college error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all colleges
const getColleges = async (req, res) => {
  try {
    const colleges = await College.find();
    res.status(200).json({ colleges });
  } catch (error) {
    console.error('Get colleges error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a college
const updateCollege = async (req, res) => {
  try {
    const { collegeId } = req.params;
    const { collegeName, domain } = req.body;

    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }

    // Check for conflicts if updating name or domain
    if (collegeName && collegeName !== college.collegeName) {
      const existing = await College.findOne({ collegeName });
      if (existing) return res.status(400).json({ error: 'College name already exists' });
      college.collegeName = collegeName;
    }

    if (domain && domain !== college.domain) {
      const existing = await College.findOne({ domain });
      if (existing) return res.status(400).json({ error: 'Domain already exists' });
      college.domain = domain;
    }

    await college.save();
    res.status(200).json({ message: 'College updated successfully', college });
  } catch (error) {
    console.error('Update college error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a college
const deleteCollege = async (req, res) => {
  try {
    const { collegeId } = req.params;

    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }

    // Check if college has associated data
    const adminCount = await CollegeAdmin.countDocuments({ collegeId });
    const userCount = await User.countDocuments({ collegeId });
    const eventCount = await Event.countDocuments({ collegeId });
    const projectCount = await Project.countDocuments({ collegeId });

    if (adminCount > 0 || userCount > 0 || eventCount > 0 || projectCount > 0) {
      return res.status(400).json({
        error: 'Cannot delete college with associated data. Please remove all college admins, users, events, and projects first.'
      });
    }

    await College.findByIdAndDelete(collegeId);
    res.status(200).json({ message: 'College deleted successfully' });
  } catch (error) {
    console.error('Delete college error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Send notification/update to all users (placeholder - implement email or in-app notification)
const sendNotification = async (req, res) => {
  try {
    const { message, type } = req.body; // type: 'info', 'warning', 'update'

    // Placeholder: In real implementation, send emails or push notifications
    console.log(`Sending ${type} notification: ${message}`);

    res.status(200).json({ message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  register,
  login,
  verifySuperAdminToken,
  getCollegeAdmins,
  approveCollegeAdmin,
  createCollege,
  getColleges,
  updateCollege,
  deleteCollege,
  getAllUsers,
  getAllEvents,
  getAllProjects,
  getAllSubscriptions,
  sendNotification,
};
