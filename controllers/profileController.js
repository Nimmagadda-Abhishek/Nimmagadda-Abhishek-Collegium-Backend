const axios = require('axios');
const Profile = require('../models/Profile');
const User = require('../models/User');

// Function to fetch GitHub profile data
const fetchGitHubProfile = async (username) => {
  try {
    const response = await axios.get(`https://api.github.com/users/${username}`);
    return {
      username,
      profileData: response.data,
    };
  } catch (error) {
    console.error('Error fetching GitHub profile:', error);
    return { username, profileData: null };
  }
};

// Function to handle LinkedIn profile (store URL, attempt fetch if possible)
// Note: LinkedIn API requires OAuth, so for now, store URL and try to fetch public data if available
const fetchLinkedInProfile = async (url) => {
  // LinkedIn doesn't have a public API without OAuth, so we'll store the URL
  // If you have LinkedIn API access, implement fetching here
  return { url, profileData: null };
};

// Create or update profile
const createOrUpdateProfile = async (req, res) => {
  try {
    const { profileImage, bio, branch, year, githubUsername, linkedinUrl } = req.body;
    const userId = req.user.userId; // From JWT middleware

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch GitHub profile if username provided
    let githubProfile = null;
    if (githubUsername) {
      githubProfile = await fetchGitHubProfile(githubUsername);
    }

    // Handle LinkedIn profile
    let linkedinProfile = null;
    if (linkedinUrl) {
      linkedinProfile = await fetchLinkedInProfile(linkedinUrl);
    }

    // Find existing profile or create new one
    let profile = await Profile.findOne({ user: userId });

    if (profile) {
      // Update existing profile
      profile.profileImage = profileImage || profile.profileImage;
      profile.bio = bio || profile.bio;
      profile.branch = branch || profile.branch;
      profile.year = year || profile.year;
      if (githubProfile) profile.githubProfile = githubProfile;
      if (linkedinProfile) profile.linkedinProfile = linkedinProfile;
      profile.updatedAt = new Date();
      await profile.save();
    } else {
      // Create new profile
      profile = new Profile({
        user: userId,
        profileImage,
        bio,
        branch,
        year,
        githubProfile,
        linkedinProfile,
      });
      await profile.save();
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      profile,
    });
  } catch (error) {
    console.error('Create/Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const profile = await Profile.findOne({ user: userId }).populate('user', 'email displayName fullName collegeName photoURL');

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.status(200).json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createOrUpdateProfile,
  getProfile,
};
