const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getJobApplications,
  getStudentApplications,
  updateApplicationStatus,
  getCompanyApplications,
  getCompanyHirings,
} = require('../controllers/jobApplicationController');
const { verifyToken } = require('../controllers/authController');
const { verifyCompanyToken } = require('../controllers/companyAuthController');

// Apply for a job (student protected)
router.post('/apply', verifyToken, applyForJob);

// Get applications for a specific job (company protected)
router.get('/job/:jobId', verifyCompanyToken, getJobApplications);

// Get student's own applications (student protected)
router.get('/student', verifyToken, getStudentApplications);

// Update application status (company protected)
router.put('/:applicationId/status', verifyCompanyToken, updateApplicationStatus);

// Get all applications for company (company protected)
router.get('/company', verifyCompanyToken, getCompanyApplications);

// Get hiring statistics for company (company protected)
router.get('/company/hirings', verifyCompanyToken, getCompanyHirings);

module.exports = router;
