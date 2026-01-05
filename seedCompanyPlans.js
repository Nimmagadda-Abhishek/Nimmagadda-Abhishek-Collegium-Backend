require('dotenv').config();
const mongoose = require('mongoose');
const CompanySubscriptionPlan = require('./models/CompanySubscriptionPlan');

const companyPlans = [
  {
    name: 'Starter',
    price: 2999,
    duration: 'monthly',
    features: {
      hiringPosts: 5,
      support: 'Basic support',
      visibility: 'Standard visibility',
      analytics: false,
      customBranding: false,
    },
  },
  {
    name: 'Professional',
    price: 4999,
    duration: 'monthly',
    features: {
      hiringPosts: 10,
      support: 'Priority support',
      visibility: 'Enhanced visibility',
      analytics: true,
      customBranding: false,
    },
  },
  {
    name: 'Enterprise',
    price: 9999,
    duration: 'monthly',
    features: {
      hiringPosts: -1, // Unlimited
      support: 'Dedicated support',
      visibility: 'Premium visibility',
      analytics: true,
      customBranding: true,
    },
  },
];

async function seedCompanyPlans() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing plans
    await CompanySubscriptionPlan.deleteMany({});
    console.log('Cleared existing company subscription plans');

    // Insert new plans
    const insertedPlans = await CompanySubscriptionPlan.insertMany(companyPlans);
    console.log(`Seeded ${insertedPlans.length} company subscription plans:`);
    insertedPlans.forEach(plan => {
      console.log(`- ${plan.name}: ₹${plan.price}/${plan.duration}`);
    });

    console.log('Company subscription plans seeded successfully!');
  } catch (error) {
    console.error('Error seeding company plans:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seeder
seedCompanyPlans();
