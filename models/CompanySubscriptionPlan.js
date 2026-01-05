const mongoose = require('mongoose');

const companySubscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
  },
  duration: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly',
  },
  features: {
    hiringPosts: {
      type: Number,
      required: true, // -1 for unlimited
    },
    support: {
      type: String,
      required: true,
    },
    visibility: {
      type: String,
      required: true,
    },
    analytics: {
      type: Boolean,
      default: false,
    },
    customBranding: {
      type: Boolean,
      default: false,
    },
  },
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
companySubscriptionPlanSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('CompanySubscriptionPlan', companySubscriptionPlanSchema);
