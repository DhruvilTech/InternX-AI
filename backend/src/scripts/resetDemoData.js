import 'dotenv/config';
import mongoose from 'mongoose';

import User from '../models/User.js';
import Student from '../models/Student.js';
import Recruiter from '../models/Recruiter.js';
import CollegeRepresentative from '../models/CollegeRepresentative.js';
import College from '../models/College.js';
import CareerPath from '../models/CareerPath.js';
import StudentCareer from '../models/StudentCareer.js';
import Internship from '../models/Internship.js';
import Task from '../models/Task.js';
import Submission from '../models/Submission.js';
import Evaluation from '../models/Evaluation.js';
import EvaluationReport from '../models/EvaluationReport.js';
import Feedback from '../models/Feedback.js';
import FeedbackReport from '../models/FeedbackReport.js';
import SkillAnalysis from '../models/SkillAnalysis.js';
import SkillGapReport from '../models/SkillGapReport.js';
import CareerIntelligence from '../models/CareerIntelligence.js';
import CareerReport from '../models/CareerReport.js';
import Certificate from '../modules/college/models/Certificate.js';
import CollegeAnalytics from '../modules/college/models/CollegeAnalytics.js';





const COLLEGES = [
    { collegeCode: 'MSU001' },
    { collegeCode: 'DAI001' },
    { collegeCode: 'NIR001' },
    { collegeCode: 'IIT001' },
    { collegeCode: 'IIV001' },
    { collegeCode: 'PDE001' },
    { collegeCode: 'CHA001' },
    { collegeCode: 'PAR001' },
    { collegeCode: 'LDC001' },
    { collegeCode: 'VIT001' },
];

const COLLEGE_ADMIN_EMAILS = [
    'admin@msu.edu',
    'admin@daiict.edu',
    'admin@nirma.edu',
    'admin@iitgn.edu',
    'admin@iiitv.edu',
    'admin@pdeu.edu',
    'admin@charusat.edu',
    'admin@parul.edu',
    'admin@ldce.edu',
    'admin@vit.edu',
];

const RECRUITER_EMAILS = [
    'recruiter@infosys.com',
    'recruiter@tcs.com',
    'recruiter@wipro.com',
    'recruiter@accenture.com',
    'recruiter@capgemini.com',
    'recruiter@cognizant.com',
    'recruiter@persistent.com',
    'recruiter@techmahindra.com',
    'recruiter@ltts.com',
    'recruiter@tataelxsi.com',
];

const STUDENT_NAMES = [
    'Aarav Sharma', 'Priya Patel', 'Ananya Singh', 'Rohan Verma', 'Neha Joshi', 'Arjun Mehta', 'Karan Shah', 'Ishita Desai',
    'Yash Patel', 'Dhruv Trivedi', 'Riya Gupta', 'Siddharth Nair', 'Tanvi Kapoor', 'Vivek Reddy', 'Pooja Mehta',
    'Aditya Kumar', 'Shreya Sharma', 'Nikhil Jain', 'Kavya Iyer', 'Rahul Patel', 'Sakshi Verma', 'Akash Singh',
    'Megha Rao', 'Harshit Trivedi', 'Diya Shah', 'Kiran Modi', 'Arnav Desai', 'Mansi Joshi', 'Dev Pandey', 'Ritu Agarwal',
    'Varun Sharma', 'Anisha Patel', 'Sumit Verma', 'Pallavi Nair', 'Aakash Mehta', 'Ritika Singh', 'Parth Shah', 'Swati Gupta',
    'Neel Trivedi', 'Sonal Kapoor', 'Harsh Reddy', 'Trisha Kumar', 'Mohit Jain', 'Sneha Iyer', 'Sameer Patel', 'Prachi Verma',
    'Chirag Singh', 'Nikita Rao', 'Divyansh Desai', 'Komal Joshi', 'Pratik Sharma', 'Ankita Patel', 'Nilay Gupta', 'Rashi Nair',
    'Abhishek Mehta', 'Poonam Shah', 'Aman Verma', 'Sunidhi Trivedi', 'Gaurav Kapoor', 'Riddhi Reddy', 'Kunal Kumar',
    'Aishwarya Jain', 'Vikram Iyer', 'Ayushi Patel', 'Saurabh Sharma', 'Heena Singh', 'Jayesh Gupta', 'Antra Nair',
    'Hemant Mehta', 'Simran Shah', 'Nishant Verma', 'Chandni Trivedi', 'Yuvraj Kapoor', 'Jhanvi Reddy', 'Akshat Kumar',
    'Bhakti Jain', 'Parv Iyer', 'Tanisha Patel', 'Ronit Sharma', 'Aditi Singh', 'Shubham Gupta', 'Kritika Nair',
    'Manas Mehta', 'Swara Shah', 'Tarun Verma', 'Ojasvi Trivedi', 'Siddhant Kapoor', 'Nandini Reddy', 'Vipul Kumar',
    'Shruti Jain', 'Umang Iyer', 'Preeti Patel', 'Lakshay Sharma', 'Isha Singh', 'Kartik Gupta', 'Deepika Nair',
    'Naman Mehta', 'Garima Shah', 'Rajat Verma', 'Sonam Trivedi', 'Ronak Kapoor', 'Varsha Reddy',
];



const STUDENT_EMAILS = STUDENT_NAMES.map((name, index) => {
    const emailSlug = name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '');
    return `${emailSlug}${index}@student.internx.ai`;
});

const CERTIFICATE_PREFIX = /^INTERNX-\d{4}-\d{4}-[A-Z0-9]{4}$/;

const disconnect = async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
};

const resetDemoData = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables.');
        }

        await mongoose.connect(process.env.MONGODB_URI);

        console.log('Connected to MongoDB');

        const collegeCodes = COLLEGES.map((c) => c.collegeCode);
        const collegeDocs = await College.find({ collegeCode: { $in: collegeCodes } }).select('_id').lean();
        const collegeIds = collegeDocs.map((doc) => doc._id);

        const targetEmails = [...COLLEGE_ADMIN_EMAILS, ...RECRUITER_EMAILS, ...STUDENT_EMAILS];
        const users = await User.find({ email: { $in: targetEmails } }).select('_id role').lean();
        const userIds = users.map((u) => u._id);
        const studentIds = users.filter((u) => u.role === 'student').map((u) => u._id);
        const recruiterIds = users.filter((u) => u.role === 'recruiter').map((u) => u._id);
        const collegeRepIds = users.filter((u) => u.role === 'college_representative').map((u) => u._id);

        console.log(`Found ${collegeIds.length} seeded colleges`);
        console.log(`Found ${studentIds.length} seeded students`);
        console.log(`Found ${recruiterIds.length} seeded recruiters`);
        console.log(`Found ${collegeRepIds.length} seeded college reps`);

        const internshipDocs = await Internship.find({ studentId: { $in: studentIds } }).select('_id').lean();
        const internshipIds = internshipDocs.map((doc) => doc._id);

        const submissionDocs = await Submission.find({ studentId: { $in: studentIds } }).select('_id').lean();
        const submissionIds = submissionDocs.map((doc) => doc._id);

        const deleteOps = [
            { name: 'CollegeAnalytics', model: CollegeAnalytics, filter: { collegeId: { $in: collegeIds } } },
            { name: 'User', model: User, filter: { email: { $in: targetEmails } } },
            { name: 'Student', model: Student, filter: { userId: { $in: studentIds } } },
            { name: 'Recruiter', model: Recruiter, filter: { userId: { $in: recruiterIds } } },
            { name: 'CollegeRepresentative', model: CollegeRepresentative, filter: { userId: { $in: collegeRepIds } } },
            { name: 'StudentCareer', model: StudentCareer, filter: { studentId: { $in: studentIds } } },
            { name: 'Internship', model: Internship, filter: { studentId: { $in: studentIds } } },
            { name: 'Task', model: Task, filter: { studentId: { $in: studentIds } } },
            { name: 'Submission', model: Submission, filter: { studentId: { $in: studentIds } } },
            { name: 'Evaluation', model: Evaluation, filter: { submissionId: { $in: submissionIds } } },
            { name: 'EvaluationReport', model: EvaluationReport, filter: { studentId: { $in: studentIds } } },
            { name: 'Feedback', model: Feedback, filter: { studentId: { $in: studentIds } } },
            { name: 'FeedbackReport', model: FeedbackReport, filter: { studentId: { $in: studentIds } } },
            { name: 'SkillAnalysis', model: SkillAnalysis, filter: { studentId: { $in: studentIds } } },
            { name: 'SkillGapReport', model: SkillGapReport, filter: { studentId: { $in: studentIds } } },
            { name: 'CareerIntelligence', model: CareerIntelligence, filter: { studentId: { $in: studentIds } } },
            { name: 'CareerReport', model: CareerReport, filter: { studentId: { $in: studentIds } } },
            { name: 'Certificate', model: Certificate, filter: { certificateId: { $regex: CERTIFICATE_PREFIX } } },
        ];

        for (const op of deleteOps) {
            const result = await op.model.deleteMany(op.filter);
            console.log(`Deleted ${result.deletedCount} ${op.name} record(s)`);
        }

        console.log('Seeded demo data cleanup complete.');
    } catch (error) {
        console.error('Error during demo data cleanup:', error);
        process.exitCode = 1;
    } finally {
        await disconnect();
    }
};

resetDemoData();
