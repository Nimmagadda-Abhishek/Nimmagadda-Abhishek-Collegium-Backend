const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  period: {
    type: String,
    enum: ['month', 'year'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  features: [{
    type: String,
  }],
  limits: {
    chats: {
      type: Number,
      default: 0,
    },
    projects: {
      type: Number,
      default: 0,
    },
    events: {
      type: Number,
      default: 0,
    },
    resources: {
      type: Number,
      default: 0,
    },
  },
  hasTrial: {
    type: Boolean,
    default: false,
  },
  trialPrice: {
    type: Number,
    default: 0,
  },
  trialDays: {
    type: Number,
    default: 0,
  },
  popular: {
    type: Boolean,
    default: false,
  },
  active: {
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

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
