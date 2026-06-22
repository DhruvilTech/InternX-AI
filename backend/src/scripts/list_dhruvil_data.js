import '../config/env.js';
import mongoose from 'mongoose';
import Task from '../models/Task.js';
import Submission from '../models/Submission.js';
import Evaluation from '../models/Evaluation.js';
import SkillGapReport from '../models/SkillGapReport.js';
import FeedbackReport from '../models/FeedbackReport.js';
import CareerReport from '../models/CareerReport.js';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB.');

    const targetUserId = '6a36dc6adbb047bed4f23af3';

    const tasks = await Task.find({ studentId: targetUserId }).lean();
    console.log(`Tasks count for Dhruvil Dev: ${tasks.length}`);

    const subs = await Submission.find({ studentId: targetUserId }).lean();
    console.log(`Submissions count for Dhruvil Dev: ${subs.length}`);

    const subIds = subs.map(s => s._id);
    const evals = await Evaluation.find({ submissionId: { $in: subIds } }).lean();
    console.log(`Evaluations count for Dhruvil Dev: ${evals.length}`);

    const skillGaps = await SkillGapReport.find({ studentId: targetUserId }).lean();
    console.log('Skill Gaps Reports:', JSON.stringify(skillGaps, null, 2));

    const feedbacks = await FeedbackReport.find({ studentId: targetUserId }).lean();
    console.log('Feedbacks Reports:', JSON.stringify(feedbacks, null, 2));

    const careers = await CareerReport.find({ studentId: targetUserId }).lean();
    console.log('Careers Reports:', JSON.stringify(careers, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
