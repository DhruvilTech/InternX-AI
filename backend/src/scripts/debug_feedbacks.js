import '../../src/config/env.js';
import mongoose from 'mongoose';
import Feedback from '../models/Feedback.js';
import Submission from '../models/Submission.js';
import User from '../models/User.js';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('DB Connected.');

    const user = await User.findOne({ email: 'arjundev@gmail.com' });
    if (!user) {
      console.log('User arjundev@gmail.com not found!');
      process.exit(1);
    }
    console.log('Student User:', { _id: user._id, fullName: user.fullName });

    const submissions = await Submission.find({ studentId: user._id });
    console.log(`Found ${submissions.length} submissions for this student:`);
    submissions.forEach(sub => {
      console.log(`- SubID: ${sub._id}, TaskID: ${sub.taskId}, Status: ${sub.status}, Type: ${sub.submissionType}`);
    });

    const feedbacks = await Feedback.find({ studentId: user._id });
    console.log(`Found ${feedbacks.length} feedbacks for this student:`);
    feedbacks.forEach(fb => {
      console.log(`- FeedbackID: ${fb._id}, taskId: ${fb.taskId}, submissionId: ${fb.submissionId}`);
      console.log(`  Strengths:`, fb.strengths);
      console.log(`  Weaknesses:`, fb.weaknesses);
      console.log(`  MentorFeedback:`, fb.mentorFeedback);
    });

    const allFeedbacks = await Feedback.find();
    console.log(`Total feedbacks in DB: ${allFeedbacks.length}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
