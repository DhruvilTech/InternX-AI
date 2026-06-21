import Feedback from '../models/Feedback.js';
import SkillAnalysis from '../models/SkillAnalysis.js';
import CareerIntelligence from '../models/CareerIntelligence.js';
import Task from '../models/Task.js';
import Submission from '../models/Submission.js';
import Interview from '../models/Interview.js';
import InterviewReport from '../models/InterviewReport.js';
import User from '../models/User.js';
import StudentCareer from '../models/StudentCareer.js';
import axios from 'axios';
import { checkReportCache, generateCareerReports } from './careerReport.service.js';

// Benchmark skills catalog
const BENCHMARK_CATALOG = {
  'Backend Developer': {
    'Node.js': 85,
    'MongoDB': 80,
    'Express': 80,
    'System Design': 70,
    'Testing': 65
  },
  'AI Engineer': {
    'Python': 85,
    'Vector Databases': 80,
    'PyTorch': 75,
    'LangChain': 70,
    'System Design': 70
  },
  'Frontend Developer': {
    'React': 85,
    'JavaScript': 85,
    'CSS': 80,
    'Framer Motion': 70,
    'Testing': 60
  }
};

const DEFAULT_BENCHMARKS = {
  'Node.js': 80,
  'MongoDB': 80,
  'Express': 80,
  'JavaScript': 80,
  'System Design': 70,
  'Testing': 60
};

// Learning recommendations catalog mapping
const RECOMMENDATION_MAPPING = {
  'Testing': [
    'Write unit tests with Mocha, Jest, or PyTest.',
    'Implement test coverage reports in your build pipeline.'
  ],
  'System Design': [
    'Practice system design, caching architectures, and rate limiting.',
    'Read and implement horizontal scaling and API gateway patterns.'
  ],
  'Node.js': [
    'Learn asynchronous patterns and event loops in Node.js.',
    'Practice building event-driven backend microservices.'
  ],
  'MongoDB': [
    'Learn aggregation pipelines and index query optimizations.',
    'Practice schema designs for relational data in MongoDB.'
  ],
  'Express': [
    'Build scalable REST APIs and centralized middleware flows.',
    'Implement robust error catching and request input validation.'
  ],
  'React': [
    'Practice React state managers (Redux/Zustand) and custom hooks.',
    'Optimize components rendering cycles using memo and callback hooks.'
  ]
};

/**
 * Automatically creates/updates the Feedback document for a task submission.
 */
export const generateFeedbackRecord = async (submissionId, taskId, studentId, internshipId, evaluationData) => {
  // Wipe duplicate task feedbacks if any
  await Feedback.deleteMany({ submissionId });

  // Generate detailed mentor feedback if not present
  let mentorFeedback = evaluationData.mentorFeedback;
  if (!mentorFeedback) {
    const strengthsStr = (evaluationData.strengths || []).join(', ');
    const recommendationsStr = (evaluationData.recommendations || []).join(', ');
    mentorFeedback = `Your implementation demonstrate strong capabilities, particularly regarding: ${strengthsStr || 'core code layout'}. Focus on improving: ${recommendationsStr || 'centralized validations'} to make the application ready for production workloads.`;
  }

  const feedback = new Feedback({
    studentId,
    internshipId,
    taskId,
    submissionId,
    strengths: evaluationData.strengths || ['Good MVC division', 'Clean router mappings'],
    weaknesses: evaluationData.weaknesses || ['Limited error catching', 'Missing testing strategy'],
    recommendations: evaluationData.recommendations || ['Add validation middleware', 'Add unit testing'],
    mentorFeedback
  });

  await feedback.save();
  console.log(`[Feedback Engine] Generated feedback report for submission ${submissionId}`);
  return feedback;
};

/**
 * Analyzes student skills and computes gaps against chosen path benchmarks.
 */
export const analyzeStudentSkills = async (studentId, careerPathInput = '') => {
  // Ensure the new reports cache is generated/validated
  let reports = await checkReportCache(studentId);
  if (!reports) {
    reports = await generateCareerReports(studentId);
  }

  const skillGap = reports.skillGap;
  const careerReport = reports.career;
  const avgScore = careerReport ? (careerReport.portfolioScore || 70) : 70;

  const allSkills = [...(skillGap.detectedSkills || []), ...(skillGap.missingSkills || [])];
  const uniqueSkills = Array.from(new Set(allSkills));

  const currentSkills = {};
  const benchmarkSkills = {};
  const skillGaps = {};

  uniqueSkills.forEach((skillName) => {
    const isMissing = skillGap.missingSkills.includes(skillName);
    const benchmark = 80;
    benchmarkSkills[skillName] = benchmark;

    let current;
    if (isMissing) {
      current = Math.max(10, Math.min(45, Math.round(avgScore * 0.5)));
    } else {
      current = Math.max(70, Math.min(98, Math.round(65 + (avgScore - 50) * 0.6)));
    }

    currentSkills[skillName] = current;
    skillGaps[skillName] = Math.max(0, benchmark - current);
  });

  // Determine Path
  let path = careerPathInput;
  if (!path) {
    const studentCareer = await StudentCareer.findOne({ studentId }).populate('careerId');
    path = studentCareer?.careerId?.title || 'Backend Developer';
  }

  // Update/Save SkillAnalysis
  let skillAnalysis = await SkillAnalysis.findOne({ studentId });
  if (!skillAnalysis) {
    skillAnalysis = new SkillAnalysis({ studentId });
  }

  skillAnalysis.careerPath = path;
  skillAnalysis.currentSkills = currentSkills;
  skillAnalysis.benchmarkSkills = benchmarkSkills;
  skillAnalysis.skillGaps = skillGaps;
  skillAnalysis.learningRecommendations = reports.feedback.recommendations || [];

  await skillAnalysis.save();
  console.log(`[Skills Engine] Synced SkillAnalysis document for student ${studentId}`);
  return skillAnalysis;
};

/**
 * Calculates Career Intelligence indexes, readiness scores, and advice.
 */
export const generateCareerIntelligence = async (studentId, internshipId = null) => {
  // Ensure the new reports cache is generated/validated
  let reports = await checkReportCache(studentId);
  if (!reports) {
    reports = await generateCareerReports(studentId);
  }

  const careerReport = reports.career;

  let intel = await CareerIntelligence.findOne({ studentId });
  if (!intel) {
    intel = new CareerIntelligence({ studentId });
  }

  intel.internshipId = internshipId;
  intel.portfolioScore = careerReport.portfolioScore || 0;
  intel.placementReadiness = careerReport.readinessScore || 0;
  intel.careerReadiness = careerReport.careerLevel || 'Beginner';
  intel.recommendedRoles = careerReport.recommendedRoles || [];
  intel.recommendedSkills = careerReport.recommendedSkills || [];
  intel.recommendedProjects = careerReport.recommendedProjects || [];
  intel.recommendedCertifications = careerReport.recommendedCertifications || [];
  intel.careerAdvice = careerReport.careerAdvice || '';

  await intel.save();
  console.log(`[Career Engine] Synced CareerIntelligence document for student ${studentId}`);
  return intel;
};


