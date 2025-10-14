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

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const postRoutes = require('./routes/post');
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/posts', postRoutes);

app.get('/health', (req, res) => {
  const routes = {
    '/api/auth/signup': 'POST - User signup',
    '/api/auth/login': 'POST - User login',
    '/api/auth/profile': 'GET - Get user profile (protected)',
    '/api/profile': 'POST - Create or update profile (protected)',
    '/api/profile': 'GET - Get profile (protected)',
    '/api/posts': 'POST - Create a new post (protected)',
    '/api/posts': 'GET - Get all posts (feed)',
    '/api/posts/user/:userId': 'GET - Get posts by a specific user',
    '/api/posts/:postId/like': 'POST - Like or unlike a post (protected)',
    '/api/posts/:postId/comment': 'POST - Add a comment to a post (protected)',
    '/api/posts/:postId': 'DELETE - Delete a post (protected)',
    '/health': 'GET - Health check'
  };
  res.json({ status: 'ok', routes });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
