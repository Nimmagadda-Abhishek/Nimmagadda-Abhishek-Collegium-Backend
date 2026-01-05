const express = require('express');
const router = express.Router();
const {
  submitReport,
  getUserReports,
  getAllReports,
  updateReportStatus,
  getReportStatistics,
} = require('../controllers/reportController');
const { verifyToken } = require('../controllers/authController');
const { verifySuperAdminToken } = require('../controllers/superAdminController');

// Submit a report (user protected)
router.post('/', verifyToken, submitReport);

// Get user's own reports (user protected)
router.get('/my-reports', verifyToken, getUserReports);

// Get all reports (super admin protected)
router.get('/', verifySuperAdminToken, getAllReports);

// Update report status (super admin protected)
router.put('/:reportId/status', verifySuperAdminToken, updateReportStatus);

// Get report statistics (super admin protected)
router.get('/statistics', verifySuperAdminToken, getReportStatistics);

module.exports = router;
