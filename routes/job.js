const express = require('express');
const router = express.Router();
const {
  createJob,
  getCompanyJobs,
  getJobById,
  updateJob,
  deleteJob,
  getAllActiveJobs,
} = require('../controllers/jobController');
const { verifyCompanyToken } = require('../controllers/companyAuthController');

// Create a new job posting (company only)
router.post('/', verifyCompanyToken, createJob);

// Get all jobs posted by the company (company only)
router.get('/company', verifyCompanyToken, getCompanyJobs);

// Get a specific job by ID (company only)
router.get('/:jobId', verifyCompanyToken, getJobById);

// Update a job posting (company only)
router.put('/:jobId', verifyCompanyToken, updateJob);

// Delete a job posting (company only)
router.delete('/:jobId', verifyCompanyToken, deleteJob);

// Get all active jobs (public - for students)
router.get('/', getAllActiveJobs);

module.exports = router;
