import '../config/env.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Student from '../models/Student.js';
import StudentCareer from '../models/StudentCareer.js';
import CareerPath from '../models/CareerPath.js';
import Submission from '../models/Submission.js';
import Task from '../models/Task.js';
import Evaluation from '../models/Evaluation.js';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB.');

    const users = await User.find({}).lean();
    console.log('=== USERS ===');
    for (const u of users) {
      console.log(`User: ${u._id} | ${u.email} | ${u.fullName} | Role: ${u.role}`);
    }

    const students = await Student.find({}).lean();
    console.log('=== STUDENTS ===');
    for (const s of students) {
      console.log(`Student: ${s._id} | User ID: ${s.userId} | College: ${s.collegeId}`);
    }

    const scs = await StudentCareer.find({}).populate('careerId').lean();
    console.log('=== STUDENT CAREERS ===');
    for (const sc of scs) {
      console.log(`StudentCareer: User ${sc.studentId} | Career Title: ${sc.careerId?.title}`);
    }

    const subs = await Submission.find({}).lean();
    console.log('=== SUBMISSIONS ===');
    for (const sub of subs) {
      console.log(`Submission: ${sub._id} | User ${sub.studentId} | Task ${sub.taskId} | Status ${sub.status}`);
    }

    const tasks = await Task.find({}).lean();
    console.log(`=== TASKS (Total: ${tasks.length}) ===`);
    for (const task of tasks.slice(0, 10)) {
      console.log(`Task: ${task._id} | Title: ${task.title} | Status: ${task.status} | User: ${task.studentId}`);
    }

    const evals = await Evaluation.find({}).lean();
    console.log(`=== EVALUATIONS (Total: ${evals.length}) ===`);
    for (const ev of evals) {
      console.log(`Eval: ${ev._id} | Submission: ${ev.submissionId} | overallScore: ${ev.overallScore}`);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
