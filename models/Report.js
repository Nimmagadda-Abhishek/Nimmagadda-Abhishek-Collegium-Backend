const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportType: {
    type: String,
    enum: ['bug', 'feature_request', 'complaint', 'feedback', 'abuse', 'other'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  attachmentFile: {
    type: String, // URL to uploaded file
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'resolved', 'dismissed'],
    default: 'pending',
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SuperAdmin',
  },
  resolutionNotes: {
    type: String,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  resolvedAt: {
    type: Date,
  },
});

// Update the resolvedAt field when status changes to resolved or dismissed
reportSchema.pre('save', function(next) {
  if ((this.status === 'resolved' || this.status === 'dismissed') && this.isModified('status')) {
    this.resolvedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Report', reportSchema);
