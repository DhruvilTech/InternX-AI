import './src/config/env.js';
import mongoose from 'mongoose';
import User from './src/models/User.js';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    // Find a recruiter
    const recruiter = await User.findOne({ role: 'recruiter' });
    if (recruiter) {
      recruiter.password = 'Password@123';
      await recruiter.save();
      console.log(`Recruiter: ${recruiter.fullName} (${recruiter.email}) - Password set to: Password@123`);
    } else {
      console.log('No recruiter found.');
    }

    // Find a college representative
    const collegeRep = await User.findOne({ role: 'college' });
    if (collegeRep) {
      collegeRep.password = 'Password@123';
      await collegeRep.save();
      console.log(`College Rep: ${collegeRep.fullName} (${collegeRep.email}) - Password set to: Password@123`);
    } else {
      console.log('No college representative found.');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
