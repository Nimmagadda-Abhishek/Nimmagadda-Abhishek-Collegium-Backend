const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  githubRepo: {
    type: String,
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  allowCollaborations: {
    type: Boolean,
    default: true,
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

module.exports = mongoose.model('Project', projectSchema);
