const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collegium', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for migration');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Migration function
const migrateUsers = async () => {
  try {
    console.log('Starting Firebase UID migration...');

    // Find all users that don't have firebaseUid
    const usersWithoutFirebaseUid = await User.find({
      $or: [
        { firebaseUid: { $exists: false } },
        { firebaseUid: null },
        { firebaseUid: '' }
      ]
    });

    console.log(`Found ${usersWithoutFirebaseUid.length} users without Firebase UID`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const user of usersWithoutFirebaseUid) {
      try {
        // Generate a temporary Firebase UID for existing users
        // In production, this should be replaced with actual Firebase Auth UIDs
        // For now, we'll create a temporary UID based on the MongoDB ObjectId
        const tempFirebaseUid = `temp_${user._id.toString()}`;

        await User.findByIdAndUpdate(user._id, {
          firebaseUid: tempFirebaseUid
        });

        console.log(`Updated user ${user.email} with temporary Firebase UID: ${tempFirebaseUid}`);
        updatedCount++;
      } catch (error) {
        console.error(`Error updating user ${user._id}:`, error);
        skippedCount++;
      }
    }

    console.log(`Migration completed:`);
    console.log(`- Updated: ${updatedCount} users`);
    console.log(`- Skipped: ${skippedCount} users`);
    console.log(`- Total processed: ${updatedCount + skippedCount} users`);

    // Verify migration
    const totalUsers = await User.countDocuments();
    const usersWithFirebaseUid = await User.countDocuments({
      firebaseUid: { $exists: true, $ne: null, $ne: '' }
    });

    console.log(`\nVerification:`);
    console.log(`- Total users: ${totalUsers}`);
    console.log(`- Users with Firebase UID: ${usersWithFirebaseUid}`);
    console.log(`- Migration success rate: ${((usersWithFirebaseUid / totalUsers) * 100).toFixed(2)}%`);

  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
};

// Main execution
const runMigration = async () => {
  try {
    await connectDB();
    await migrateUsers();
    console.log('\n✅ Migration completed successfully!');
    console.log('\n⚠️  IMPORTANT: Replace temporary Firebase UIDs with actual Firebase Auth UIDs');
    console.log('   Update each user\'s firebaseUid field with their real Firebase Authentication UID');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration, migrateUsers };
