const Post = require('../models/Post');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { checkLimitExceeded } = require('../utils/subscriptionUtils');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'posts', // Optional: specify a folder in Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif'], // Optional: restrict file types
    public_id: (req, file) => Date.now().toString() + '-' + file.originalname,
  },
});

const upload = multer({ storage: storage });

// Create a new post
const createPost = async (req, res) => {
  console.log('Create post API called for user:', req.user.userId, 'with caption:', req.body.caption, 'and file:', req.file ? 'present' : 'missing');

  try {
    const { caption } = req.body;
    const userId = req.user.userId; // From JWT middleware

    if (!caption) {
      console.error('Create post validation failed: Caption is required');
      return res.status(400).json({ error: 'Caption is required' });
    }

    if (!req.file) {
      console.error('Create post validation failed: Image is required');
      return res.status(400).json({ error: 'Image is required' });
    }

    // Check subscription limits
    const limitExceeded = await checkLimitExceeded(userId, 'chats');
    if (limitExceeded) {
      console.error('Create post failed: Monthly post limit exceeded for user:', userId);
      return res.status(403).json({ error: 'Monthly post creation limit exceeded. Upgrade your plan for more posts.' });
    }

    console.log('Uploading image to Cloudinary...');
    // The image URL is provided by Cloudinary in req.file.path
    const imageUrl = req.file.path;
    console.log('Image uploaded successfully, URL:', imageUrl);

    console.log('Creating new post in database...');
    const newPost = new Post({
      user: userId,
      collegeId: req.user.collegeId,
      caption,
      image: imageUrl,
    });

    await newPost.save();
    console.log('Post created successfully with ID:', newPost._id);

    // Populate user details for response
    await newPost.populate('user', 'displayName photoURL');

    res.status(201).json({
      message: 'Post created successfully',
      post: newPost,
    });
  } catch (error) {
    console.error('Create post error occurred:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      userId: req.user?.userId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all posts (feed)
const getPosts = async (req, res) => {
  console.log('Get posts API called (feed)');

  try {
    const posts = await Post.find({ collegeId: req.user.collegeId })
      .populate('user', 'displayName photoURL')
      .populate('likes', 'displayName')
      .populate('comments.user', 'displayName')
      .sort({ createdAt: -1 }); // Most recent first

    console.log('Get posts successful, returned', posts.length, 'posts');
    res.status(200).json({ posts });
  } catch (error) {
    console.error('Get posts error occurred:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get posts by a specific user
const getUserPosts = async (req, res) => {
  console.log('Get user posts API called for user:', req.params.userId);

  try {
    const { userId } = req.params;

    const posts = await Post.find({ user: userId })
      .populate('user', 'displayName photoURL')
      .populate('likes', 'displayName')
      .populate('comments.user', 'displayName')
      .sort({ createdAt: -1 });

    console.log('Get user posts successful, returned', posts.length, 'posts for user:', userId);
    res.status(200).json({ posts });
  } catch (error) {
    console.error('Get user posts error occurred:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      userId: req.params?.userId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Like or unlike a post
const likePost = async (req, res) => {
  console.log('Like post API called for post:', req.params.postId, 'by user:', req.user.userId);

  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    const post = await Post.findById(postId);
    if (!post) {
      console.error('Like post failed: Post not found with ID:', postId);
      return res.status(404).json({ error: 'Post not found' });
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      console.log('Unliking post:', postId, 'by user:', userId);
      // Unlike the post
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      console.log('Liking post:', postId, 'by user:', userId);
      // Like the post
      post.likes.push(userId);
    }

    await post.save();
    console.log('Like/unlike operation successful for post:', postId, 'new likes count:', post.likes.length);

    res.status(200).json({
      message: isLiked ? 'Post unliked' : 'Post liked',
      likesCount: post.likes.length,
    });
  } catch (error) {
    console.error('Like post error occurred:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      postId: req.params?.postId,
      userId: req.user?.userId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add a comment to a post
const addComment = async (req, res) => {
  console.log('Add comment API called for post:', req.params.postId, 'by user:', req.user.userId, 'with text:', req.body.text);

  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user.userId;

    if (!text) {
      console.error('Add comment validation failed: Comment text is required');
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      console.error('Add comment failed: Post not found with ID:', postId);
      return res.status(404).json({ error: 'Post not found' });
    }

    console.log('Adding comment to post:', postId);
    const newComment = {
      user: userId,
      text,
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    // Populate the new comment's user
    await post.populate('comments.user', 'displayName');

    const addedComment = post.comments[post.comments.length - 1];
    console.log('Comment added successfully to post:', postId, 'comment ID:', addedComment._id);

    res.status(201).json({
      message: 'Comment added successfully',
      comment: addedComment,
    });
  } catch (error) {
    console.error('Add comment error occurred:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      postId: req.params?.postId,
      userId: req.user?.userId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a post (only by the owner)
const deletePost = async (req, res) => {
  console.log('Delete post API called for post:', req.params.postId, 'by user:', req.user.userId);

  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    const post = await Post.findById(postId);
    if (!post) {
      console.error('Delete post failed: Post not found with ID:', postId);
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.user.toString() !== userId) {
      console.error('Delete post failed: User', userId, 'not authorized to delete post', postId, 'owned by', post.user);
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    console.log('Deleting post:', postId, 'by owner:', userId);
    await Post.findByIdAndDelete(postId);
    console.log('Post deleted successfully:', postId);

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error occurred:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      postId: req.params?.postId,
      userId: req.user?.userId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createPost,
  getPosts,
  getUserPosts,
  likePost,
  addComment,
  deletePost,
  upload,
};
