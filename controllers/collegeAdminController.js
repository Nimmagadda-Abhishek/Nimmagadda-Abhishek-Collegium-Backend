const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const admin = require('firebase-admin');
const CollegeAdmin = require('../models/CollegeAdmin');
const College = require('../models/College');
const Profile = require('../models/Profile');
const Project = require('../models/Project');
const { sendOtpEmail } = require('../utils/emailService');
const { sendPushNotification } = require('../utils/firebaseService');

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

    // Create Firebase Auth user
    const firebaseUser = await admin.auth().createUser({
      email,
      password,
      displayName: collegeName,
      emailVerified: false,
    });

    // Hash password for local storage
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const adminDoc = new CollegeAdmin({
      collegeId: college._id,
      email,
      password: hashedPassword,
      firebaseUid: firebaseUser.uid,
    });

    await adminDoc.save();

    // Send notification to super admin for approval
    const superAdmins = await require('../models/SuperAdmin').find();
    if (superAdmins.length > 0) {
      const superAdmin = superAdmins[0]; // Assuming there's at least one super admin
      await sendPushNotification(
        superAdmin._id,
        'New College Admin Registration',
        `A new college admin from ${collegeName} has registered and needs approval.`,
        { type: 'college_admin_approval', adminId: adminDoc._id }
      );
    }

    res.status(201).json({
      message: 'College admin registered successfully. Please verify your email and wait for super admin approval.',
      firebaseUid: firebaseUser.uid
    });
  } catch (error) {
    console.error('Register college admin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Send OTP to college admin email
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if admin exists
    const adminDoc = await CollegeAdmin.findOne({ email });
    if (!adminDoc) {
      return res.status(404).json({ error: 'College admin not found' });
    }

    // Check if admin is approved
    if (!adminDoc.isApproved) {
      return res.status(403).json({ error: 'College admin not approved yet' });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Set OTP expiration (10 minutes from now)
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP to database
    adminDoc.otp = otp;
    adminDoc.otpExpires = otpExpires;
    await adminDoc.save();

    // Send OTP email
    await sendOtpEmail(email, otp);

    res.status(200).json({ message: 'OTP sent to your email successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login college admin with OTP
const login = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Find admin
    const adminDoc = await CollegeAdmin.findOne({ email });
    if (!adminDoc) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check if admin is approved
    if (!adminDoc.isApproved) {
      return res.status(403).json({ error: 'College admin not approved yet' });
    }

    // Check OTP
    if (!adminDoc.otp || adminDoc.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Check if OTP is expired
    if (adminDoc.otpExpires < new Date()) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    // Clear OTP after successful login
    adminDoc.otp = undefined;
    adminDoc.otpExpires = undefined;
    await adminDoc.save();

    // Generate JWT token
    const token = jwt.sign({ adminId: adminDoc._id, collegeId: adminDoc.collegeId }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'Login successful',
      admin: {
        id: adminDoc._id,
        collegeId: adminDoc.collegeId,
        email: adminDoc.email,
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

// Get college admin profile
const getProfile = async (req, res) => {
  try {
    const admin = await CollegeAdmin.findById(req.admin.adminId).populate('collegeId', 'collegeName domain');
    if (!admin) {
      return res.status(404).json({ error: 'College admin not found' });
    }

    res.status(200).json({
      profile: {
        id: admin._id,
        email: admin.email,
        collegeName: admin.collegeId.collegeName,
        collegeDomain: admin.collegeId.domain,
        isApproved: admin.isApproved,
        createdAt: admin.createdAt,
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get dashboard statistics for college admin
const getDashboardStats = async (req, res) => {
  try {
    const admin = await CollegeAdmin.findById(req.admin.adminId);
    if (!admin) {
      return res.status(404).json({ error: 'College admin not found' });
    }

    const collegeId = admin.collegeId;

    // Get total students in the college
    const profiles = await Profile.find().populate({
      path: 'user',
      match: { collegeId },
    });
    const totalStudents = profiles.filter(profile => profile.user).length;

    // Get total events created by the admin
    const Event = require('../models/Event');
    const totalEvents = await Event.countDocuments({ createdBy: req.admin.adminId });

    // Get total active events
    const activeEvents = await Event.countDocuments({ createdBy: req.admin.adminId, status: 'active' });

    // Get total event registrations across all admin's events
    const events = await Event.find({ createdBy: req.admin.adminId });
    const totalRegistrations = events.reduce((sum, event) => sum + event.registrations.length, 0);

    // Get total projects in the college
    const totalProjects = await Project.countDocuments({ collegeId, isActive: true });

    res.status(200).json({
      stats: {
        totalStudents,
        totalEvents,
        activeEvents,
        totalRegistrations,
        totalProjects,
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all events in the college for the admin
const getEvents = async (req, res) => {
  try {
    const Event = require('../models/Event');
    const events = await Event.find({ collegeId: req.admin.collegeId })
      .populate('createdBy', 'email')
      .sort({ date: 1 });
    res.status(200).json({ events });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get students in the college (alias for getUsers but for college admin)
const getStudents = async (req, res) => {
  try {
    const admin = await CollegeAdmin.findById(req.admin.adminId);
    if (!admin) {
      return res.status(404).json({ error: 'College admin not found' });
    }

    const collegeId = admin.collegeId;

    // Find profiles where the associated user's collegeId matches
    const profiles = await Profile.find().populate({
      path: 'user',
      match: { collegeId },
    });

    // Filter out profiles where user is null (due to match)
    const filteredProfiles = profiles.filter(profile => profile.user);

    // Map to the required format
    const students = filteredProfiles.map(profile => ({
      name: profile.user.fullName,
      email: profile.user.email,
      department: profile.branch,
      year: profile.year,
      status: 'active', // Placeholder as no status field exists
      profileImage: profile.profileImage,
    }));

    res.status(200).json({ students });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all projects in the college (for college admin)
const getProjects = async (req, res) => {
  console.log('Get projects API called for college admin');

  try {
    const projects = await Project.find({ collegeId: req.admin.collegeId, isActive: true })
      .populate('user', 'displayName photoURL')
      .populate('collaborators', 'displayName photoURL')
      .sort({ createdAt: -1 }); // Most recent first

    console.log('Get projects successful, returned', projects.length, 'projects');
    res.status(200).json({ projects });
  } catch (error) {
    console.error('Get projects error occurred:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update college admin profile
const updateProfile = async (req, res) => {
  try {
    const { collegeName, password, confirmPassword } = req.body;

    const adminDoc = await CollegeAdmin.findById(req.admin.adminId);
    if (!adminDoc) {
      return res.status(404).json({ error: 'College admin not found' });
    }

    let updates = [];

    // Update College Name
    if (collegeName) {
      const college = await College.findById(adminDoc.collegeId);
      if (college) {
        if (college.collegeName !== collegeName) {
          // Check if new name is taken
          const existingCollege = await College.findOne({ collegeName });
          if (existingCollege) {
            return res.status(400).json({ error: 'College name already taken' });
          }
          college.collegeName = collegeName;
          await college.save();
          updates.push('College Name');
        }
      }
    }

    // Update Password
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }
      if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      adminDoc.password = hashedPassword;
      await adminDoc.save();
      updates.push('Password');
    }

    if (updates.length > 0) {
      res.status(200).json({
        message: `Profile updated successfully (${updates.join(', ')})`,
        profile: {
          id: adminDoc._id,
          email: adminDoc.email,
          collegeName: collegeName // Return the new or existing name
        }
      });
    } else {
      res.status(200).json({ message: 'No changes made to profile' });
    }

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  register,
  sendOtp,
  login,
  verifyCollegeAdminToken,
  getUsers,
  getProfile,
  updateProfile,
  getDashboardStats,
  getEvents,
  getStudents,
  getProjects,
};
