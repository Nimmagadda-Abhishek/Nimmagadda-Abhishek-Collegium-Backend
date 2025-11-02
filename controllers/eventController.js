const Event = require('../models/Event');
const User = require('../models/User');
const { checkLimitExceeded } = require('../utils/subscriptionUtils');

// Create a new event (only by college admin)
const createEvent = async (req, res) => {
  try {
    const { title, date, category, location, maxParticipants, description, banner } = req.body;

    if (!title || !date || !category || !location || !maxParticipants || !description || !banner) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Get collegeId from admin
    const CollegeAdmin = require('../models/CollegeAdmin');
    const admin = await CollegeAdmin.findById(req.admin.adminId);
    if (!admin) {
      return res.status(404).json({ error: 'College admin not found' });
    }

    const event = new Event({
      title,
      date,
      category,
      location,
      maxParticipants,
      description,
      banner,
      createdBy: req.admin.adminId, // College admin ID
      collegeId: admin.collegeId, // College ID from admin
    });

    await event.save();
    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Register for an event
const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.registrations.some(reg => reg.userId.toString() === userId)) {
      return res.status(400).json({ error: 'User already registered for this event' });
    }

    if (event.registrations.length >= event.maxParticipants) {
      return res.status(400).json({ error: 'Event is full' });
    }

    // Check subscription limits
    const limitExceeded = await checkLimitExceeded(userId, 'events');
    if (limitExceeded) {
      console.error('Register for event failed: Monthly event registration limit exceeded for user:', userId);
      return res.status(403).json({ error: 'Monthly event registration limit exceeded. Upgrade your plan for more registrations.' });
    }

    event.registrations.push({ userId, registeredAt: new Date() });
    await event.save();

    res.status(200).json({ message: 'Registered successfully', event });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all events
const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ collegeId: req.user.collegeId }).populate('createdBy', 'displayName email').sort({ date: 1 });
    res.status(200).json({ events });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a single event by ID
const getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId).populate('createdBy', 'displayName email').populate('registrations', 'displayName email');
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.status(200).json({ event });
  } catch (error) {
    console.error('Get event by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin view: Get registered users for an event
const adminViewRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId).populate('registrations', 'displayName email fullName collegeName');
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    // Assuming admin check: for now, any authenticated user can view, but in production, add role check
    res.status(200).json({ event: { title: event.title, registrations: event.registrations } });
  } catch (error) {
    console.error('Admin view registrations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all events created by the admin
const getAdminEvents = async (req, res) => {
  try {
    const adminId = req.admin.adminId;
    const events = await Event.find({ createdBy: adminId }).populate('createdBy', 'collegeName email').sort({ date: 1 });
    res.status(200).json({ events });
  } catch (error) {
    console.error('Get admin events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update event status (active, closed, postponed)
const updateEventStatus = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status } = req.body;
    const adminId = req.admin.adminId;

    if (!['active', 'closed', 'postponed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be active, closed, or postponed' });
    }

    const event = await Event.findOne({ _id: eventId, createdBy: adminId });
    if (!event) {
      return res.status(404).json({ error: 'Event not found or not authorized' });
    }

    event.status = status;
    await event.save();

    res.status(200).json({ message: 'Event status updated successfully', event });
  } catch (error) {
    console.error('Update event status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createEvent,
  registerForEvent,
  getEvents,
  getEventById,
  adminViewRegistrations,
  getAdminEvents,
  updateEventStatus,
};
