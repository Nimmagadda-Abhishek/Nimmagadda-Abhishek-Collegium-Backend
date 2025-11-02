const express = require('express');
const {
  createPost,
  getPosts,
  getUserPosts,
  likePost,
  addComment,
  deletePost,
  upload,
} = require('../controllers/postController');
const { verifyToken } = require('../controllers/authController');

const router = express.Router();

// Create a new post (protected) - with multer middleware for image upload
router.post('/', verifyToken, upload.single('image'), createPost);

// Get all posts (feed)
router.get('/', verifyToken, getPosts);

// Get posts by a specific user
router.get('/user/:userId', getUserPosts);

// Like or unlike a post (protected)
router.post('/:postId/like', verifyToken, likePost);

// Add a comment to a post (protected)
router.post('/:postId/comment', verifyToken, addComment);

// Delete a post (protected)
router.delete('/:postId', verifyToken, deletePost);

module.exports = router;
