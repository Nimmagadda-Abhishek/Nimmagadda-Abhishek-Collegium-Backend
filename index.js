const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { connectDb } = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDb();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const postRoutes = require('./routes/post');
const projectRoutes = require('./routes/project');
const subscriptionRoutes = require('./routes/subscriptions');
const paymentRoutes = require('./routes/payments');
const eventRoutes = require('./routes/event');
const collegeAdminRoutes = require('./routes/collegeAdmin');
const superAdminRoutes = require('./routes/superAdmin');
const notificationRoutes = require('./routes/notifications');
const chatRoutes = require('./routes/chat');
const companyAuthRoutes = require('./routes/companyAuth');
const jobRoutes = require('./routes/job');
const jobApplicationRoutes = require('./routes/jobApplication');
const reportRoutes = require('./routes/report');
const companySubscriptionRoutes = require('./routes/companySubscriptions');
const companyPaymentRoutes = require('./routes/companyPayments');

// Route middleware
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/college-admin', collegeAdminRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/company/auth', companyAuthRoutes);
app.use('/api/company/jobs', jobRoutes);
app.use('/api/job-applications', jobApplicationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/company/subscriptions', companySubscriptionRoutes);
app.use('/api/company/payments', companyPaymentRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
