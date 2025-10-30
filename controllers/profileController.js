const axios = require('axios');
const Profile = require('../models/Profile');
const User = require('../models/User');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// ====================
// 🔧 Cloudinary Config
// ====================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ====================
// 🧩 Multer for Cloudinary
// ====================
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'profiles',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

const upload = multer({
  storage: profileStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ====================
// 🐙 Fetch GitHub Profile Data
// ====================
const fetchGitHubProfile = async (username) => {
  try {
    const response = await axios.get(`https://api.github.com/users/${username}`);
    return {
      username,
      profileData: response.data,
    };
  } catch (error) {
    console.error('❌ Error fetching GitHub profile:', error.message);
    return { username, profileData: null };
  }
};

// ====================
// 💼 Handle LinkedIn Profile
// ====================
const fetchLinkedInProfile = async (url) => {
  // LinkedIn API requires OAuth; here we only store the URL
  return { url, profileData: null };
};

// ====================
// ✍️ Create or Update Profile
// ====================
const createOrUpdateProfile = async (req, res) => {
  console.log('➡️ Profile API called by user:', req.user.userId);

  try {
    const userId = req.user.userId;
    const { bio, branch, year, githubUsername, linkedinUrl } = req.body;

    let profileImageUrl = req.body.profileImage; 
    if (req.file) {
      profileImageUrl = req.file.path;
    } else if (req.body.profileImage && req.body.profileImage.startsWith('data:image')) {
      try {
        const uploadedImage = await cloudinary.uploader.upload(req.body.profileImage, {
          folder: 'profiles',
          resource_type: 'image',
        });
        profileImageUrl = uploadedImage.secure_url;
      } catch (uploadError) {
        console.error('❌ Cloudinary upload error:', JSON.stringify(uploadError, null, 2));
        return res.status(500).json({
          success: false,
          error: 'Image upload failed',
          details: uploadError,
        });
      }
    }

    // 🧾 Validation
    if (!bio || !branch || !year) {
      return res.status(400).json({ error: 'Bio, branch, and year are required' });
    }

    // 🔍 Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 🐙 Fetch GitHub (if provided)
    let githubProfile = null;
    if (githubUsername) {
      githubProfile = await fetchGitHubProfile(githubUsername);
    }

    // 💼 Handle LinkedIn (if provided)
    let linkedinProfile = null;
    if (linkedinUrl) {
      linkedinProfile = await fetchLinkedInProfile(linkedinUrl);
    }

    // 🧠 Find existing profile or create new
    let profile = await Profile.findOne({ user: userId });

    if (profile) {
      // 🔄 Update profile
      profile.profileImage = profileImageUrl || profile.profileImage;
      profile.bio = bio;
      profile.branch = branch;
      profile.year = year;
      if (githubProfile) profile.githubProfile = githubProfile;
      if (linkedinProfile) profile.linkedinProfile = linkedinProfile;
      profile.updatedAt = new Date();

      await profile.save();
      console.log('✅ Profile updated for user:', userId);
    } else {
      // 🆕 Create new profile
      profile = new Profile({
        user: userId,
        profileImage: profileImageUrl,
        bio,
        branch,
        year,
        githubProfile,
        linkedinProfile,
      });

      await profile.save();
      console.log('✅ Profile created for user:', userId);
    }

    // 📨 Send response to frontend
    return res.status(200).json({
      success: true,
      message: 'Profile saved successfully',
      profile,
    });
  } catch (error) {
    console.error('❌ Profile create/update error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
    });
  }
};

// ====================
// 📄 Get Profile
// ====================
const getProfile = async (req, res) => {
  console.log('➡️ Fetching profile for user:', req.user.userId);

  try {
    const userId = req.user.userId;

    const profile = await Profile.findOne({ user: userId }).populate(
      'user',
      'email displayName fullName collegeName photoURL'
    );

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    console.log('✅ Profile fetched for user:', userId);
    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
    });
  }
};

// ====================
// 🚀 Export
// ====================
module.exports = {
  upload,
  createOrUpdateProfile,
  getProfile,
};
