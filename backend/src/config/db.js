import mongoose from 'mongoose';
import User from '../models/User.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Seed Fixed Admin
    try {
      // Clean up other admin users to ensure ONLY one admin exists
      await User.deleteMany({ role: 'admin', email: { $ne: 'admin123@gmail.com' } });

      const adminEmail = 'admin123@gmail.com';
      const adminPassword = 'Admin@123';

      let admin = await User.findOne({ email: adminEmail });
      if (!admin) {
        admin = new User({
          fullName: 'System Admin',
          email: adminEmail,
          password: adminPassword,
          role: 'admin',
          isVerified: true,
          profileCompleted: true
        });
        await admin.save();
        console.log(`Fixed Admin user seeded successfully! (${adminEmail})`);
      } else {
        admin.password = adminPassword;
        admin.role = 'admin';
        admin.isVerified = true;
        admin.profileCompleted = true;
        await admin.save();
        console.log(`Fixed Admin user updated successfully! (${adminEmail})`);
      }
    } catch (seedError) {
      console.error(`Admin Seeding failed: ${seedError.message}`);
    }
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    console.warn('Server is running, but database features will fail until connection is resolved.');
  }
};

export default connectDB;
