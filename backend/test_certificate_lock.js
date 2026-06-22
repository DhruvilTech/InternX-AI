import './src/config/env.js';
import mongoose from 'mongoose';
import User from './src/models/User.js';
import Student from './src/models/Student.js';
import Internship from './src/models/Internship.js';
import Task from './src/models/Task.js';
import Certificate from './src/modules/college/models/Certificate.js';
import { getCertificateProgress } from './src/controllers/career.controller.js';

const run = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected successfully.');

    // 1. Create a mock student
    const mockEmail = `cert_tester_${Date.now()}@example.com`;
    const user = await User.create({
      fullName: 'Certificate Tester',
      email: mockEmail,
      password: 'password123',
      role: 'student',
      isVerified: true,
      profileCompleted: true
    });

    const student = await Student.create({
      userId: user._id,
      fullName: user.fullName,
      collegeName: 'Test University',
      course: 'Computer Science',
      year: 2,
      skills: ['JavaScript']
    });

    // Create a mock internship for the user with all required fields
    const internship = await Internship.create({
      studentId: user._id,
      companyName: 'NeuralMind Technologies',
      industry: 'Artificial Intelligence',
      companyDescription: 'Leading provider of simulated professional internships.',
      department: 'Engineering',
      workCulture: 'Collaborative and highly autonomous',
      roleTitle: 'AI Research Intern',
      managerName: 'Sarah Johnson',
      managerRole: 'Lead AI Scientist',
      managerIntroduction: 'Hello, I am Sarah, your manager.',
      projectName: 'NeuralMind Assistant API',
      projectDescription: 'Building a simulated chatbot assistant backend API.',
      startDate: new Date()
    });

    console.log(`Created test student: ${user.fullName} (${user._id})`);

    // --- Scenario A: 0 completed tasks out of 5 total tasks (0% completion < 80%) ---
    console.log('\n--- Scenario A: 0% Task Completion (< 80%) ---');
    for (let i = 1; i <= 5; i++) {
      await Task.create({
        studentId: user._id,
        internshipId: internship._id,
        title: `Mock Task ${i}`,
        description: 'Mock task details',
        difficulty: 'Easy',
        estimatedHours: 4,
        status: 'todo',
        score: 0
      });
    }

    let progressData = null;
    const mockReqA = { user: { _id: user._id, fullName: user.fullName } };
    const mockResA = {
      status: (code) => {
        if (code !== 200) {
          console.error(`Error code: ${code}`);
        }
        return {
          json: (data) => {
            progressData = data.data;
          }
        };
      }
    };

    await getCertificateProgress(mockReqA, mockResA, (err) => {
      console.error('Next middleware called with error:', err);
    });

    console.log('Progress Data (Scenario A):', progressData);
    if (!progressData) {
      throw new Error('Verification failed: No progress data returned from getCertificateProgress!');
    }

    if (progressData.completionPercentage !== 0 || progressData.isEligible !== false) {
      throw new Error('Verification failed: Scenario A eligibility/completion percentage is incorrect!');
    }

    if (
      progressData.verificationCode !== 'LOCKED' ||
      progressData.company !== 'LOCKED' ||
      progressData.roleTitle !== 'LOCKED' ||
      progressData.manager !== 'LOCKED' ||
      progressData.issueDate !== 'LOCKED' ||
      progressData.grade !== 0
    ) {
      throw new Error('Verification failed: Scenario A details were NOT locked/masked!');
    }
    console.log('Scenario A verified: All details and credential ID are successfully BLOCKED/LOCKED.');

    // --- Scenario B: 4 completed tasks out of 5 total tasks (80% completion >= 80%) ---
    console.log('\n--- Scenario B: 80% Task Completion (>= 80%) ---');
    
    // Update 4 tasks to completed with scores
    const tasks = await Task.find({ studentId: user._id });
    for (let i = 0; i < 4; i++) {
      tasks[i].status = 'completed';
      tasks[i].score = 90;
      await tasks[i].save();
    }

    let progressDataB = null;
    const mockReqB = { user: { _id: user._id, fullName: user.fullName } };
    const mockResB = {
      status: (code) => {
        if (code !== 200) {
          console.error(`Error code: ${code}`);
        }
        return {
          json: (data) => {
            progressDataB = data.data;
          }
        };
      }
    };

    await getCertificateProgress(mockReqB, mockResB, (err) => {
      console.error('Next middleware called with error:', err);
    });

    console.log('Progress Data (Scenario B):', progressDataB);
    if (!progressDataB) {
      throw new Error('Verification failed: No progress data returned for Scenario B!');
    }

    if (progressDataB.completionPercentage !== 80 || progressDataB.isEligible !== true) {
      throw new Error('Verification failed: Scenario B eligibility/completion percentage is incorrect!');
    }

    if (
      progressDataB.verificationCode === 'LOCKED' ||
      progressDataB.company === 'LOCKED' ||
      progressDataB.roleTitle === 'LOCKED' ||
      progressDataB.manager === 'LOCKED' ||
      progressDataB.issueDate === 'LOCKED' ||
      progressDataB.grade !== 90
    ) {
      throw new Error('Verification failed: Scenario B details remained locked or were not populated correctly!');
    }
    console.log('Scenario B verified: Certificate generated, eligible flag is true, and real details are returned.');

    // Cleanup mock data
    console.log('\nCleaning up mock data...');
    await Task.deleteMany({ studentId: user._id });
    await Internship.deleteOne({ _id: internship._id });
    await Certificate.deleteMany({ studentId: user._id });
    await Student.deleteOne({ _id: student._id });
    await User.deleteOne({ _id: user._id });
    console.log('Cleanup completed.');

    console.log('\nSUCCESS: All certificate progress lock logic verified on backend!');
    process.exit(0);
  } catch (err) {
    console.error('Verification failed:', err);
    process.exit(1);
  }
};

run();
