import '../../src/config/env.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import FeedbackReport from '../models/FeedbackReport.js';
import SkillGapReport from '../models/SkillGapReport.js';
import CareerReport from '../models/CareerReport.js';
import { generateCareerReports, checkReportCache } from '../services/careerReport.service.js';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected successfully.');

    const user = await User.findOne({ email: 'arjundev@gmail.com' });
    if (!user) {
      console.log('Student user arjundev@gmail.com not found!');
      process.exit(1);
    }
    console.log('Target Student:', { _id: user._id, fullName: user.fullName });

    console.log('\n--- Running Dynamic Career Report Generation ---');
    const reports = await generateCareerReports(user._id);

    console.log('\n--- 1. Feedback Report (feedback_reports) ---');
    const feedback = await FeedbackReport.findOne({ studentId: user._id });
    console.log(JSON.stringify(feedback, null, 2));

    console.log('\n--- 2. Skill Gap Report (skill_gap_reports) ---');
    const skillGap = await SkillGapReport.findOne({ studentId: user._id });
    console.log(JSON.stringify(skillGap, null, 2));

    console.log('\n--- 3. Career Report (career_reports) ---');
    const career = await CareerReport.findOne({ studentId: user._id });
    console.log(JSON.stringify(career, null, 2));

    console.log('\n--- 4. Testing Cache Validator ---');
    const cached = await checkReportCache(user._id);
    console.log('Cache Validator Result:', cached ? 'CACHE VALID (Hit)' : 'CACHE INVALID (Miss)');

    process.exit(0);
  } catch (err) {
    console.error('Error during test execution:', err);
    process.exit(1);
  }
};

run();
