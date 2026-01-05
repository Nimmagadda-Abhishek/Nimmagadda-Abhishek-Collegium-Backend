const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  hiringType: {
    type: String,
    enum: ['internship', 'full-time', 'part-time', 'contract', 'freelance'],
    required: true,
  },
  workLocation: {
    type: String,
    enum: ['remote', 'on-site', 'hybrid'],
    required: true,
  },
  budget: {
    type: Number,
    required: true,
  },
  stipend: {
    type: Number,
    default: 0,
  },
  duration: {
    type: String,
    required: true, // e.g., "3 months", "6 months", "1 year"
  },
  numberOfOpenings: {
    type: Number,
    required: true,
    min: 1,
  },
  requiredSkills: [{
    type: String,
    required: true,
  }],
  isActive: {
    type: Boolean,
    default: true,
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

// Update the updatedAt field before saving
jobSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Job', jobSchema);
