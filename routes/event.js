const express = require('express');
const { createEvent, registerForEvent, getEvents, getEventById, adminViewRegistrations, getAdminEvents, likeEvent, getTrendingEvents, searchEvents, updateEventStatus, uploadEventBanner, getUserRegistrations, verifyUserRegistration } = require('../controllers/eventController');
const { verifyToken } = require('../controllers/authController');
const { verifyCollegeAdminToken } = require('../controllers/collegeAdminController');

const router = express.Router();

// Create a new event (only college admin)
router.post('/create', verifyCollegeAdminToken, uploadEventBanner.single('banner'), createEvent);

// Register for an event (user)
router.post('/register/:eventId', verifyToken, registerForEvent);

// Get all events (protected)
router.get('/', verifyToken, getEvents);

// Get available events (trending)
router.get('/trending', verifyToken, getTrendingEvents);

// Search events
router.get('/search', verifyToken, searchEvents);

// Get user's registered events (Must be before /:eventId)
router.get('/my-registrations', verifyToken, getUserRegistrations);

// Verify specific registration
router.get('/my-registrations/:eventId', verifyToken, verifyUserRegistration);

// Get a single event by ID (protected)
router.get('/:eventId', verifyToken, getEventById);

// Like or unlike an event (user)
router.post('/like/:eventId', verifyToken, likeEvent);

// Admin view: Get registered users for an event (college admin)
router.get('/admin/registrations/:eventId', verifyCollegeAdminToken, adminViewRegistrations);

// Get all events created by the admin (college admin)
router.get('/admin/events', verifyCollegeAdminToken, getAdminEvents);

// Update event status (active, closed, postponed) (college admin)
router.put('/admin/status/:eventId', verifyCollegeAdminToken, updateEventStatus);

module.exports = router;
