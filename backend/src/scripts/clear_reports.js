import '../config/env.js';
import mongoose from 'mongoose';
import FeedbackReport from '../models/FeedbackReport.js';
import SkillGapReport from '../models/SkillGapReport.js';
import CareerReport from '../models/CareerReport.js';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB.');

    const fRes = await FeedbackReport.deleteMany({});
    const sRes = await SkillGapReport.deleteMany({});
    const cRes = await CareerReport.deleteMany({});

    console.log('Cleared FeedbackReports:', fRes.deletedCount);
    console.log('Cleared SkillGapReports:', sRes.deletedCount);
    console.log('Cleared CareerReports:', cRes.deletedCount);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
