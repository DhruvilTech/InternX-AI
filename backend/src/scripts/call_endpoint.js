import '../config/env.js';
import mongoose from 'mongoose';
import { generateCareerReports } from '../services/careerReport.service.js';
import User from '../models/User.js';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne({ email: 'arjundev@gmail.com' });
    if (!user) {
      console.log('User arjundev@gmail.com not found');
      process.exit(1);
    }
    const reports = await generateCareerReports(user._id);
    console.log('REPORTS RESULT:');
    console.log('skillComparisonData length:', reports.skillComparisonData?.length);
    console.log('gaps length:', reports.gaps?.length);
    console.log('gaps:', JSON.stringify(reports.gaps, null, 2));
    console.log('skillComparisonData:', JSON.stringify(reports.skillComparisonData, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
