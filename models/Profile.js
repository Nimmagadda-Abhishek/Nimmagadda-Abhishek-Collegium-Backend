const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  profileImage: {
    type: String, // URL or path to profile image
  },
  bio: {
    type: String,
  },
  branch: {
    type: String, // e.g., Computer Science, Mechanical Engineering
  },
  year: {
    type: String, // e.g., 1st Year, 2nd Year, or number
  },
  githubProfile: {
    username: String,
    profileData: Object, // Store fetched GitHub profile data
  },
  linkedinProfile: {
    url: String, // LinkedIn profile URL
    profileData: Object, // Store fetched LinkedIn profile data if possible
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Profile', profileSchema);
