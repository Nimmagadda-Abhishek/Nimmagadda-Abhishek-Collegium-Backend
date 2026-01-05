const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Company = require('../models/Company');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const JWT_SECRET = process.env.JWT_SECRET;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for file uploads
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'company-documents',
    allowed_formats: ['jpg', 'png', 'pdf'],
  },
});

const upload = multer({ storage: storage });

// Signup function
const signup = async (req, res) => {
  try {
    const { companyName, contactName, email, phone, password, confirmPassword } = req.body;

    if (!companyName || !contactName || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Check if company already exists
    const existingCompany = await Company.findOne({ $or: [{ email }, { companyName }] });
    if (existingCompany) {
      return res.status(400).json({ error: 'Company with this email or name already exists' });
    }

    // Create new company
    const company = new Company({
      companyName,
      contactName,
      email,
      phone,
      password,
    });

    await company.save();

    // Generate JWT token
    const token = jwt.sign({ companyId: company._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Company registered successfully',
      company: {
        id: company._id,
        companyName: company.companyName,
        contactName: company.contactName,
        email: company.email,
        phone: company.phone,
      },
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login function
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find company
    const company = await Company.findOne({ email });
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Check if company is approved by super admin
    if (!company.isApproved) {
      return res.status(403).json({ error: 'Your company registration is pending approval by super admin' });
    }

    // Check password
    const isMatch = await company.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Update last login
    company.lastLogin = new Date();
    await company.save();

    // Generate JWT token
    const token = jwt.sign({ companyId: company._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'Login successful',
      company: {
        id: company._id,
        companyName: company.companyName,
        contactName: company.contactName,
        email: company.email,
        phone: company.phone,
        isOnboarded: company.isOnboarded,
        isVerified: company.isVerified,
        isApproved: company.isApproved,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Onboarding function
const onboarding = [
  upload.fields([
    { name: 'certificateOfIncorporation', maxCount: 1 },
    { name: 'gstCertificate', maxCount: 1 },
    { name: 'companyIdProof', maxCount: 1 },
    { name: 'authorizedSignatoryIdProof', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        website,
        natureOfWork,
        yearOfIncorporation,
        registrationNumber,
        registeredAddress,
        city,
        state,
        country,
        pincode,
      } = req.body;

      const companyId = req.company.companyId;

      const company = await Company.findById(companyId);
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }

      // Update onboarding fields
      company.website = website;
      company.natureOfWork = natureOfWork;
      company.yearOfIncorporation = yearOfIncorporation;
      company.registrationNumber = registrationNumber;
      company.registeredAddress = registeredAddress;
      company.city = city;
      company.state = state;
      company.country = country;
      company.pincode = pincode;

      // Handle file uploads
      if (req.files.certificateOfIncorporation) {
        company.certificateOfIncorporation = req.files.certificateOfIncorporation[0].path;
      }
      if (req.files.gstCertificate) {
        company.gstCertificate = req.files.gstCertificate[0].path;
      }
      if (req.files.companyIdProof) {
        company.companyIdProof = req.files.companyIdProof[0].path;
      }
      if (req.files.authorizedSignatoryIdProof) {
        company.authorizedSignatoryIdProof = req.files.authorizedSignatoryIdProof[0].path;
      }

      company.isOnboarded = true;
      await company.save();

      res.status(200).json({
        message: 'Onboarding completed successfully',
        company: {
          id: company._id,
          companyName: company.companyName,
          website: company.website,
          natureOfWork: company.natureOfWork,
          yearOfIncorporation: company.yearOfIncorporation,
          registrationNumber: company.registrationNumber,
          registeredAddress: company.registeredAddress,
          city: company.city,
          state: company.state,
          country: company.country,
          pincode: company.pincode,
          certificateOfIncorporation: company.certificateOfIncorporation,
          gstCertificate: company.gstCertificate,
          companyIdProof: company.companyIdProof,
          authorizedSignatoryIdProof: company.authorizedSignatoryIdProof,
          isOnboarded: company.isOnboarded,
        },
      });
    } catch (error) {
      console.error('Onboarding error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];

// Get company profile (company protected)
const getCompanyProfile = async (req, res) => {
  try {
    const companyId = req.company.companyId;

    const company = await Company.findById(companyId).select('-password');
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.status(200).json({
      message: 'Company profile retrieved successfully',
      company: {
        id: company._id,
        companyName: company.companyName,
        contactName: company.contactName,
        email: company.email,
        phone: company.phone,
        website: company.website,
        natureOfWork: company.natureOfWork,
        yearOfIncorporation: company.yearOfIncorporation,
        registrationNumber: company.registrationNumber,
        registeredAddress: company.registeredAddress,
        city: company.city,
        state: company.state,
        country: company.country,
        pincode: company.pincode,
        certificateOfIncorporation: company.certificateOfIncorporation,
        gstCertificate: company.gstCertificate,
        companyIdProof: company.companyIdProof,
        authorizedSignatoryIdProof: company.authorizedSignatoryIdProof,
        isOnboarded: company.isOnboarded,
        isVerified: company.isVerified,
        createdAt: company.createdAt,
        lastLogin: company.lastLogin,
      },
    });
  } catch (error) {
    console.error('Get company profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get company dashboard data (company protected)
const getCompanyDashboard = async (req, res) => {
  try {
    const companyId = req.company.companyId;

    // Get active subscription
    const CompanySubscription = require('../models/CompanySubscription');
    const Job = require('../models/Job');
    const JobApplication = require('../models/JobApplication');

    const subscription = await CompanySubscription.findOne({ companyId, status: 'active' })
      .populate('planId')
      .sort({ createdAt: -1 });

    let activePlan = null;
    if (subscription && subscription.planId) {
      activePlan = {
        name: subscription.planId.name,
        expiresOn: subscription.endDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      };
    }

    // Get posts remaining
    const plan = subscription ? subscription.planId : null;
    const hiringPostsLimit = plan ? plan.features.hiringPosts : 0;

    // Count active jobs (assuming active jobs count towards the limit)
    const activeJobsCount = await Job.countDocuments({ companyId, isActive: true });
    const postsRemaining = hiringPostsLimit === -1 ? 'Unlimited' : Math.max(0, hiringPostsLimit - activeJobsCount);

    // Calculate percentage change (simplified - comparing to last month)
    // For now, we'll use a placeholder. In a real implementation, you'd track historical data
    const postsUsed = hiringPostsLimit === -1 ? 0 : activeJobsCount;
    const percentageChange = '+20%'; // Placeholder - would calculate from historical data

    // Get applications count (active hirings)
    const activeApplications = await JobApplication.countDocuments({
      companyId,
      status: { $in: ['pending', 'reviewed'] }
    });

    // Get recent applications
    const recentApplications = await JobApplication.find({ companyId })
      .populate('jobId', 'title')
      .populate('studentId', 'displayName email')
      .sort({ appliedAt: -1 })
      .limit(5)
      .select('status appliedAt jobId studentId');

    // Get recent hirings (accepted applications)
    const recentHirings = await JobApplication.find({ companyId, status: 'accepted' })
      .populate('jobId', 'title')
      .populate('studentId', 'displayName email')
      .sort({ reviewedAt: -1 })
      .limit(5)
      .select('status appliedAt reviewedAt jobId studentId');

    res.status(200).json({
      message: 'Company dashboard data retrieved successfully',
      dashboard: {
        activePlan,
        postsRemaining: {
          current: postsUsed,
          limit: hiringPostsLimit === -1 ? 'Unlimited' : hiringPostsLimit,
          display: hiringPostsLimit === -1 ? 'Unlimited' : `${postsUsed}/${hiringPostsLimit}`,
          percentageChange,
        },
        applications: {
          activeHirings: activeApplications,
          recent: recentApplications,
        },
        recentHirings,
      },
    });
  } catch (error) {
    console.error('Get company dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Middleware to verify JWT token for companies
const verifyCompanyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.company = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

module.exports = {
  signup,
  login,
  onboarding,
  getCompanyProfile,
  getCompanyDashboard,
  verifyCompanyToken,
};
