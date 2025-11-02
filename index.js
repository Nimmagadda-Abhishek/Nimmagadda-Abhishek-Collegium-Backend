require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware for CORS
app.use(cors({
  origin: '*',
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: '*'
}));

// Middleware for parsing JSON and URL-encoded bodies
// It's crucial to have these before the routes.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Middleware to log request body for debugging
app.use((req, res, next) => {
  console.log('Incoming Request Body:', req.body);
  next();
});

// Routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const postRoutes = require('./routes/post');
const projectRoutes = require('./routes/project');
const subscriptionRoutes = require('./routes/subscriptions');
const paymentRoutes = require('./routes/payments');
const eventRoutes = require('./routes/event');
const collegeAdminRoutes = require('./routes/collegeAdmin');
const superAdminRoutes = require('./routes/superAdmin');
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/college-admin', collegeAdminRoutes);
app.use('/api/super-admin', superAdminRoutes);

app.get('/health', (req, res) => {
  const routes = {
    '/api/auth/signup': 'POST - User signup',
    '/api/auth/login': 'POST - User login',
    '/api/auth/profile': 'GET - Get user profile (protected)',
    '/api/auth/search': 'GET - Search users (protected)',
    '/api/profile': 'POST - Create or update profile (protected)',
    '/api/profile': 'GET - Get profile (protected)',
    '/api/posts': 'POST - Create a new post (protected)',
    '/api/posts': 'GET - Get all posts (feed)',
    '/api/posts/user/:userId': 'GET - Get posts by a specific user',
    '/api/posts/:postId/like': 'POST - Like or unlike a post (protected)',
    '/api/posts/:postId/comment': 'POST - Add a comment to a post (protected)',
    '/api/posts/:postId': 'DELETE - Delete a post (protected)',
    '/api/projects': 'POST - Create a new project (protected)',
    '/api/projects': 'GET - Get all projects (feed)',
    '/api/projects/user/:userId': 'GET - Get projects by a specific user',
    '/api/projects/search': 'GET - Search projects (protected)',
    '/api/projects/:projectId': 'GET - Get a single project by ID (protected)',
    '/api/projects/:projectId': 'PUT - Update a project (protected)',
    '/api/projects/:projectId': 'DELETE - Delete a project (protected)',
    '/api/projects/:projectId/collaborator': 'POST - Add a collaborator to a project (protected)',
    '/api/projects/:projectId/collaborator': 'DELETE - Remove a collaborator from a project (protected)',
    '/api/subscriptions/plans': 'GET - List all subscription plans',
    '/api/subscriptions/user': 'GET - Get user subscription (protected)',
    '/api/subscriptions/subscribe': 'POST - Subscribe to a plan (protected)',
    '/api/subscriptions/cancel': 'PUT - Cancel subscription (protected)',
    '/api/subscriptions/history': 'GET - Get subscription history (protected)',
    '/api/subscriptions/trials/start': 'POST - Start trial (protected)',
    '/api/subscriptions/trials/status': 'GET - Get trial status (protected)',
    '/api/subscriptions/trials/convert': 'POST - Convert trial to paid (protected)',
    '/api/payments/create-order': 'POST - Create payment order (protected)',
    '/api/payments/verify': 'POST - Verify payment (protected)',
    '/api/payments/webhook': 'POST - Handle payment webhooks',
    '/api/events/create': 'POST - Create a new event (protected)',
    '/api/events/register/:eventId': 'POST - Register for an event (protected)',
    '/api/events': 'GET - Get all events (protected)',
    '/api/events/:eventId': 'GET - Get a single event by ID (protected)',
    '/api/events/admin/registrations/:eventId': 'GET - Admin view registered users for an event (protected)',
    '/api/college-admin/register': 'POST - Register college admin',
    '/api/college-admin/login': 'POST - Login college admin',
    '/health': 'GET - Health check'
  };
  res.json({ status: 'ok', routes });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});