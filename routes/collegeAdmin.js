const express = require('express');
const { register, login, getUsers, verifyCollegeAdminToken, getProfile, getDashboardStats, getEvents, getStudents } = require('../controllers/collegeAdminController');
const { createEvent, adminViewRegistrations, updateEventStatus, uploadEventBanner } = require('../controllers/eventController');
const { verifyToken } = require('../controllers/authController');

const router = express.Router();

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Get users route (protected)
router.get('/users', verifyToken, getUsers);

// Get college admin profile (protected)
router.get('/profile', verifyCollegeAdminToken, getProfile);

// Get dashboard statistics (protected)
router.get('/dashboard/stats', verifyCollegeAdminToken, getDashboardStats);

// Create event (protected)
router.post('/events/create', verifyCollegeAdminToken, uploadEventBanner.single('banner'), createEvent);

// Get events created by the admin (protected) - alias for admin/events
router.get('/events', verifyCollegeAdminToken, getEvents);

// Admin view registrations for an event (protected)
router.get('/events/admin/registrations/:eventId', verifyCollegeAdminToken, adminViewRegistrations);
// Admin view registrations for an event (protected)
router.get('/events/admin/registrations/:eventId', verifyCollegeAdminToken, adminViewRegistrations);

// Update event status (protected)
router.put('/events/admin/status/:eventId', verifyCollegeAdminToken, updateEventStatus);

// Get students in the college (protected)
router.get('/students', verifyCollegeAdminToken, getStudents);

module.exports = router;
