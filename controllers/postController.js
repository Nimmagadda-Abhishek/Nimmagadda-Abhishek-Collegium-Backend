const Post = require('../models/Post');

// Create a new post
const createPost = async (req, res) => {
  try {
    const { caption, image } = req.body;
    const userId = req.user.userId; // From JWT middleware

    if (!caption || !image) {
      return res.status(400).json({ error: 'Caption and image are required' });
    }

    const newPost = new Post({
      user: userId,
      caption,
      image,
    });

    await newPost.save();

    // Populate user details for response
    await newPost.populate('user', 'displayName photoURL');

    res.status(201).json({
      message: 'Post created successfully',
      post: newPost,
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all posts (feed)
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'displayName photoURL')
      .populate('likes', 'displayName')
      .populate('comments.user', 'displayName')
      .sort({ createdAt: -1 }); // Most recent first

    res.status(200).json({ posts });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get posts by a specific user
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    const posts = await Post.find({ user: userId })
      .populate('user', 'displayName photoURL')
      .populate('likes', 'displayName')
      .populate('comments.user', 'displayName')
      .sort({ createdAt: -1 });

    res.status(200).json({ posts });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Like or unlike a post
const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // Unlike the post
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      // Like the post
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({
      message: isLiked ? 'Post unliked' : 'Post liked',
      likesCount: post.likes.length,
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add a comment to a post
const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user.userId;

    if (!text) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

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

    res.status(201).json({
      message: 'Comment added successfully',
      comment: addedComment,
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a post (only by the owner)
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.user.toString() !== userId) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    await Post.findByIdAndDelete(postId);

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
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
};
