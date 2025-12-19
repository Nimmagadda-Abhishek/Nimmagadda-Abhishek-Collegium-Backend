const mongoose = require('mongoose');
const SubscriptionPlan = require('./models/SubscriptionPlan');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collegium', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed data
const subscriptionPlans = [
  {
    name: 'Basic',
    price: 0,
    period: 'month',
    description: 'Free plan with basic features for getting started.',
    features: [
      'Free login and signup',
      '5 chats per month',
      '5 resources per month',
      '2 projects per month'
    ],
    limits: {
      chats: 5,
      projects: 2,
      events: 0,
      resources: 5,
    },
    hasTrial: false,
    trialPrice: 0,
    trialDays: 0,
    popular: false,
    active: true,
  },
  {
    name: 'Pro',
    price: 199,
    period: 'month',
    description: 'Advanced plan with more features and higher limits.',
    features: [
      'All Basic features',
      '10 chats per month',
      '10 resources per month',
      '5 projects per month'
    ],
    limits: {
      chats: 10,
      projects: 5,
      events: 0,
      resources: 10,
    },
    hasTrial: true,
    trialPrice: 10,
    trialDays: 7,
    popular: true,
    active: true,
  },
  {
    name: 'Elite',
    price: 499,
    period: 'month',
    description: 'Premium plan with unlimited access to all features.',
    features: [
      'All Pro features',
      'Unlimited chats',
      'Unlimited resources',
      'Unlimited projects'
    ],
    limits: {
      chats: 999999,
      projects: 999999,
      events: 999999,
      resources: 999999,
    },
    hasTrial: true,
    trialPrice: 10,
    trialDays: 7,
    popular: false,
    active: true,
  },
];

// Seeding function
const seedPlans = async () => {
  try {
    console.log('Starting subscription plans seeding...');

    for (const planData of subscriptionPlans) {
      const existingPlan = await SubscriptionPlan.findOne({ name: planData.name });
      if (existingPlan) {
        console.log(`Plan '${planData.name}' already exists, skipping...`);
        continue;
      }

      const plan = new SubscriptionPlan(planData);
      await plan.save();
      console.log(`Seeded plan: ${planData.name}`);
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding error:', error);
    throw error;
  }
};

// Main execution
const runSeed = async () => {
  try {
    await connectDB();
    await seedPlans();
    console.log('\n✅ Subscription plans seeded successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run seed if this file is executed directly
if (require.main === module) {
  runSeed();
}

module.exports = { runSeed, seedPlans };
