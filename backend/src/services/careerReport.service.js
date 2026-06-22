import User from '../models/User.js';
import Student from '../models/Student.js';
import Internship from '../models/Internship.js';
import Task from '../models/Task.js';
import Submission from '../models/Submission.js';
import Evaluation from '../models/Evaluation.js';
import GithubProfile from '../models/GithubProfile.js';
import GithubContribution from '../models/GithubContribution.js';
import Interview from '../models/Interview.js';
import InterviewReport from '../models/InterviewReport.js';
import StudentCareer from '../models/StudentCareer.js';
import CareerPath from '../models/CareerPath.js';
import FeedbackReport from '../models/FeedbackReport.js';
import SkillGapReport from '../models/SkillGapReport.js';
import CareerReport from '../models/CareerReport.js';
import axios from 'axios';
import { callGroq } from './groq.service.js';

export const DYNAMIC_SKILL_REGISTRY = {
  'Cyber Security': [
    'Network Security',
    'Threat Intelligence',
    'Incident Response',
    'SIEM',
    'Digital Forensics',
    'Vulnerability Assessment',
    'Penetration Testing',
    'Cloud Security',
    'IAM',
    'Security Monitoring'
  ],
  'Frontend': [
    'HTML',
    'CSS',
    'JavaScript',
    'React',
    'State Management',
    'Responsive Design',
    'Performance Optimization',
    'Accessibility',
    'API Integration',
    'Testing'
  ],
  'Data Science': [
    'Python',
    'Statistics',
    'EDA',
    'Machine Learning',
    'Feature Engineering',
    'Model Evaluation',
    'Data Visualization',
    'SQL',
    'Deep Learning'
  ]
};

export const DYNAMIC_BENCHMARKS = {
  'Cyber Security': {
    'Network Security': 85,
    'Threat Intelligence': 85,
    'Incident Response': 80,
    'SIEM': 80,
    'Digital Forensics': 75,
    'Vulnerability Assessment': 80,
    'Penetration Testing': 85,
    'Cloud Security': 80,
    'IAM': 75,
    'Security Monitoring': 80
  },
  'Frontend': {
    'HTML': 90,
    'CSS': 90,
    'JavaScript': 85,
    'React': 85,
    'State Management': 80,
    'Responsive Design': 85,
    'Performance Optimization': 80,
    'Accessibility': 75,
    'API Integration': 80,
    'Testing': 75
  },
  'Data Science': {
    'Python': 90,
    'Statistics': 85,
    'EDA': 80,
    'Machine Learning': 85,
    'Feature Engineering': 80,
    'Model Evaluation': 80,
    'Data Visualization': 80,
    'SQL': 85,
    'Deep Learning': 75
  }
};

export const DYNAMIC_RECOMMENDATIONS = {
  'Network Security': {
    title: 'Packet Filter Firewall',
    recommend: 'Implement a network packet analysis script to filter unauthorized ports.'
  },
  'Threat Intelligence': {
    title: 'Threat Feed Aggregator',
    recommend: 'Build an ingestion pipeline for open threat feeds (OTX/MISP).'
  },
  'Incident Response': {
    title: 'Alert Incident Playbook',
    recommend: 'Define automated security incident workflow tasks for phishing outbreaks.'
  },
  'SIEM': {
    title: 'SIEM Log Parser',
    recommend: 'Build a log collector parsing authentication events into a structured SIEM feed.'
  },
  'Digital Forensics': {
    title: 'Memory Dump Audit',
    recommend: 'Extract and analyze memory image artifacts from a compromised node.'
  },
  'Vulnerability Assessment': {
    title: 'Port Vulnerability Scanner',
    recommend: 'Develop a socket-based port scanner highlighting out-of-date service banners.'
  },
  'Penetration Testing': {
    title: 'Exploit Payload Lab',
    recommend: 'Simulate web parameter tampering attacks in a sandbox environment.'
  },
  'Cloud Security': {
    title: 'IAM Policy Auditor',
    recommend: 'Script an AWS IAM checker parsing permissive policy wildcards.'
  },
  'IAM': {
    title: 'RBAC Model Designer',
    recommend: 'Model Role-Based Access Control logic with fine-grained API gates.'
  },
  'Security Monitoring': {
    title: 'Traffic Volume Analyzer',
    recommend: 'Monitor network interfaces and alert on bandwidth spikes.'
  },
  'HTML': {
    title: 'Semantic Document Layout',
    recommend: 'Refactor generic divs to semantic HTML5 elements for SEO optimization.'
  },
  'CSS': {
    title: 'Glassmorphic Theme Customizer',
    recommend: 'Create interactive glass effect layouts using CSS variables.'
  },
  'JavaScript': {
    title: 'Event Debounce Utility',
    recommend: 'Write utility functions throttling search input requests.'
  },
  'React': {
    title: 'Dashboard UI',
    recommend: 'Assemble complex multi-pane application layout using React.'
  },
  'State Management': {
    title: 'Global Context Store',
    recommend: 'Implement decentralized context selectors using Zustand or Redux.'
  },
  'Responsive Design': {
    title: 'Responsive Navigation Drawer',
    recommend: 'Create fluid media queries adjusting menu drawers on mobile viewports.'
  },
  'Performance Optimization': {
    title: 'Lazy Route Splitting',
    recommend: 'Split page code using React Lazy loading wrapper routes.'
  },
  'Accessibility': {
    title: 'Screen Reader Form Controller',
    recommend: 'Add ARIA labels and focus management trap for form modals.'
  },
  'API Integration': {
    title: 'Axios Interceptor Handler',
    recommend: 'Inject JWT bearer tokens and capture expired responses automatically.'
  },
  'Testing': {
    title: 'Component Render Test Suite',
    recommend: 'Write Jest test assertions verifying button hover triggers.'
  },
  'Python': {
    title: 'CSV Parsing Utility',
    recommend: 'Write python scripts processing bulk logs with standard file streams.'
  },
  'Statistics': {
    title: 'Hypothesis Testing Lab',
    recommend: 'Perform A/B split testing analysis on user conversion metrics.'
  },
  'EDA': {
    title: 'Outlier Detection Script',
    recommend: 'Identify anomalies in numeric columns using Z-Score bounds.'
  },
  'Machine Learning': {
    title: 'Supervised Classifier Training',
    recommend: 'Train classification models predicting user conversion probability.'
  },
  'Feature Engineering': {
    title: 'One-Hot Encoder Pipeline',
    recommend: 'Encode high-cardinality text categories into numeric features.'
  },
  'Model Evaluation': {
    title: 'Confusion Matrix Plotter',
    recommend: 'Assess model performance with ROC-AUC curves and F1-Scores.'
  },
  'Data Visualization': {
    title: 'Distribution Histogram Grid',
    recommend: 'Draw distribution maps using Matplotlib subplots.'
  },
  'SQL': {
    title: 'Aggregate CTE Queries',
    recommend: 'Write Common Table Expressions grouping user sessions metrics.'
  },
  'Deep Learning': {
    title: 'Sequential Neural Net',
    recommend: 'Build dense classification layer models using TensorFlow/Keras.'
  }
};

export const DYNAMIC_CERTIFICATIONS = {
  'Cyber Security': [
    { title: 'CompTIA Security+', trigger: 'Network Security' },
    { title: 'Certified Ethical Hacker (CEH)', trigger: 'Penetration Testing' },
    { title: 'CompTIA CySA+', trigger: 'Threat Intelligence' }
  ],
  'Frontend': [
    { title: 'React Certification (Meta)', trigger: 'React' },
    { title: 'W3C Frontend Web Developer', trigger: 'HTML' },
    { title: 'Frontend Masters Professional Cert', trigger: 'Performance Optimization' }
  ],
  'Data Science': [
    { title: 'Google Data Analytics Professional', trigger: 'SQL' },
    { title: 'DeepLearning.AI Machine Learning Specialization', trigger: 'Machine Learning' },
    { title: 'TensorFlow Developer Certificate', trigger: 'Deep Learning' }
  ]
};

export const normalizeCareerPath = (title) => {
  const t = (title || '').toLowerCase();
  if (t.includes('cyber') || t.includes('security') || t.includes('shield')) {
    return 'Cyber Security';
  }
  if (t.includes('front')) {
    return 'Frontend';
  }
  if (t.includes('data science') || t.includes('data scientist') || t.includes('statistic') || t.includes('analytics') || t.includes('ai') || t.includes('machine learning')) {
    return 'Data Science';
  }
  return 'Cyber Security'; // Default fallback
};

export const validateReportPath = (reports, selectedPath) => {
  if (!reports || !reports.skillGap || !reports.career || !reports.feedback) return false;
  const normalizedPath = normalizeCareerPath(selectedPath);
  const registrySkills = DYNAMIC_SKILL_REGISTRY[normalizedPath] || [];

  // 1. Verify skills in skillGap belong to the registry
  const missing = reports.skillGap.missingSkills || [];
  const detected = reports.skillGap.detectedSkills || [];
  const allSkills = [...missing, ...detected];
  for (const s of allSkills) {
    if (!registrySkills.includes(s)) return false;
  }

  // 2. Verify certifications belong to the domain
  const certTitles = (DYNAMIC_CERTIFICATIONS[normalizedPath] || []).map(c => c.title);
  const recommendedCerts = reports.career.recommendedCertifications || [];
  for (const c of recommendedCerts) {
    if (!certTitles.includes(c)) return false;
  }

  // 3. Verify recommendations are generated from the registry
  const recommendations = reports.feedback.recommendations || [];
  for (const r of recommendations) {
    const parts = r.split(':');
    const recTitle = parts[0]?.trim();
    let found = false;
    for (const skill of registrySkills) {
      const recItem = DYNAMIC_RECOMMENDATIONS[skill];
      if (recItem && recItem.title === recTitle) {
        found = true;
        break;
      }
    }
    if (!found && recommendations.length > 0) return false;
  }

  return true;
};

export const generateCareerReports = async (studentId) => {
  const user = await User.findById(studentId);
  if (!user) throw new Error('User not found');

  const studentProfile = await Student.findOne({ userId: studentId });
  const internship = await Internship.findOne({ studentId });
  const tasks = await Task.find({ studentId });
  const studentCareer = await StudentCareer.findOne({ studentId }).populate('careerId');

  // Calculate career path
  let careerPath = 'Cybersecurity Analyst';
  if (internship?.internshipRole) {
    careerPath = internship.internshipRole;
  } else if (internship?.roleTitle) {
    careerPath = internship.roleTitle;
  } else if (studentCareer?.careerId?.title) {
    careerPath = studentCareer.careerId.title;
  }

  const normalizedPath = normalizeCareerPath(careerPath);
  const registrySkills = DYNAMIC_SKILL_REGISTRY[normalizedPath];
  const benchmarks = DYNAMIC_BENCHMARKS[normalizedPath];

  // Fetch all completed tasks
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const submissions = await Submission.find({ studentId });
  const allSubIds = submissions.map(s => s._id);
  const allEvaluations = await Evaluation.find({ submissionId: { $in: allSubIds } });

  // Calculate skill scores based on completed tasks, difficulty, submission quality, and evaluation score
  const skillScores = {};
  registrySkills.forEach(skillName => {
    // Find all completed tasks that target this skill (via skillsImpacted or requiredSkills)
    const matchingTasks = completedTasks.filter(t => {
      const impacted = t.skillsImpacted || [];
      const required = t.requiredSkills || [];
      return impacted.some(s => s.toLowerCase() === skillName.toLowerCase()) || 
             required.some(s => s.toLowerCase() === skillName.toLowerCase());
    });

    if (matchingTasks.length === 0) {
      skillScores[skillName] = 0;
    } else {
      let sumScaledScores = 0;
      matchingTasks.forEach(t => {
        const taskScore = t.score || 0;
        let difficultyMultiplier = 1.0;
        if (t.difficulty === 'Easy') difficultyMultiplier = 0.9;
        if (t.difficulty === 'Hard') difficultyMultiplier = 1.1;

        // Try to locate evaluation to compute submission quality
        const sub = submissions.find(s => s.taskId.toString() === t._id.toString());
        let submissionQuality = taskScore;
        if (sub) {
          const evalDoc = allEvaluations.find(e => e.submissionId.toString() === sub._id.toString());
          if (evalDoc) {
            submissionQuality = (
              (evalDoc.codeQualityScore || taskScore) +
              (evalDoc.architectureScore || taskScore) +
              (evalDoc.documentationScore || taskScore)
            ) / 3;
          }
        }

        const taskContribution = (taskScore * 0.7) + (submissionQuality * 0.3);
        const scaledScore = Math.min(100, Math.round(taskContribution * difficultyMultiplier));
        sumScaledScores += scaledScore;
      });

      skillScores[skillName] = Math.round(sumScaledScores / matchingTasks.length);
    }
  });

  // Calculate missingSkills (genuine gaps where StudentScore < Benchmark)
  const missingSkills = [];
  const detectedSkills = [];
  const skillComparisonData = [];
  const gaps = [];

  registrySkills.forEach(skillName => {
    const studentScore = skillScores[skillName] || 0;
    const benchmark = benchmarks[skillName] || 80;
    const gapVal = benchmark - studentScore;

    skillComparisonData.push({
      subject: skillName,
      current: studentScore,
      benchmark,
      fullMark: 100
    });

    if (gapVal > 0) {
      missingSkills.push(skillName);
      
      let level = 'Beginner';
      if (studentScore >= 60) {
        level = 'Job Ready';
      } else if (studentScore >= 30) {
        level = 'Intermediate';
      }

      const recTemplate = DYNAMIC_RECOMMENDATIONS[skillName] || {
        title: `Improve ${skillName}`,
        recommend: `Practice building systems using ${skillName} in your projects.`
      };

      gaps.push({
        skill: skillName,
        gap: `${gapVal}%`,
        level,
        recommend: `${recTemplate.title}: ${recTemplate.recommend}`
      });
    } else {
      detectedSkills.push(skillName);
    }
  });

  const gapPercentage = Math.round((missingSkills.length / registrySkills.length) * 100);

  // 1. Task Completion Score
  const totalTasks = tasks.length;
  const completedTasksCount = completedTasks.length;
  const taskCompletion = totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 0;

  // 2. Submission Quality
  let submissionQuality = 0;
  if (allEvaluations.length > 0) {
    const sum = allEvaluations.reduce((acc, e) => {
      const codeQuality = e.codeQualityScore || 0;
      const arch = e.architectureScore || 0;
      const doc = e.documentationScore || 0;
      const completion = e.overallScore || e.technicalScore || 0;
      return acc + (codeQuality + arch + doc + completion) / 4;
    }, 0);
    submissionQuality = sum / allEvaluations.length;
  }

  // 3. GitHub Score
  let githubScore = 0;
  const githubSubmissions = submissions.filter(s => s.submissionType === 'github');
  const githubProfile = await GithubProfile.findOne({ userId: studentId });
  if (githubProfile && githubSubmissions.length > 0) {
    const gitSubIds = githubSubmissions.map(s => s._id);
    const gitEvaluations = allEvaluations.filter(e => gitSubIds.some(id => id.toString() === e.submissionId.toString()));
    if (gitEvaluations.length > 0) {
      const sumGithubScores = gitEvaluations.reduce((acc, e) => acc + (e.githubScore || e.repositoryScore || 0), 0);
      githubScore = Math.round(sumGithubScores / gitEvaluations.length);
    }
  }

  // 4. Interview Score
  const interviews = await Interview.find({ studentId, status: 'completed' });
  const interviewReports = await InterviewReport.find({ interviewId: { $in: interviews.map(i => i._id) } });
  let interviewScore = 0;
  if (interviewReports.length > 0) {
    const sumInterviews = interviewReports.reduce((acc, r) => acc + r.overallScore, 0);
    interviewScore = Math.round(sumInterviews / interviewReports.length);
  }

  // 5. Portfolio Score
  let portfolioScore = (taskCompletion * 0.30) + (submissionQuality * 0.30) + (githubScore * 0.20) + (interviewScore * 0.20);
  portfolioScore = Math.min(100, Math.max(0, Math.round(portfolioScore)));

  // 6. Placement Ready Score
  const skillCoverage = registrySkills.length > 0
    ? Math.round(((registrySkills.length - missingSkills.length) / registrySkills.length) * 100)
    : 0;
  const internshipProgress = taskCompletion;
  let readinessScore = (portfolioScore * 0.40) + (skillCoverage * 0.20) + (internshipProgress * 0.20) + (interviewScore * 0.20);
  readinessScore = Math.min(100, Math.max(0, Math.round(readinessScore)));

  if (allEvaluations.length === 0 && submissions.length === 0 && interviewReports.length === 0) {
    portfolioScore = 0;
    readinessScore = 0;
  }

  // Select domain-aligned certifications dynamically
  const certsForPath = DYNAMIC_CERTIFICATIONS[normalizedPath] || [];
  const recommendedCertifications = [];
  const avgScore = completedTasks.length > 0 ? (completedTasks.reduce((acc, t) => acc + (t.score || 0), 0) / completedTasks.length) : 0;

  if (avgScore < 50) {
    if (certsForPath[0]) recommendedCertifications.push(certsForPath[0].title);
  } else if (avgScore < 80) {
    if (certsForPath[1]) recommendedCertifications.push(certsForPath[1].title);
  } else {
    if (certsForPath[2]) recommendedCertifications.push(certsForPath[2].title);
  }

  certsForPath.forEach(c => {
    if (missingSkills.includes(c.trigger) && !recommendedCertifications.includes(c.title)) {
      recommendedCertifications.push(c.title);
    }
  });

  if (recommendedCertifications.length === 0 && certsForPath.length > 0) {
    recommendedCertifications.push(certsForPath[0].title);
  }

  // Create recommendations from gaps
  const recommendationsList = gaps.map(g => g.recommend);

  // Save/Update in database collections
  await FeedbackReport.deleteMany({ studentId });
  const feedbackReport = new FeedbackReport({
    studentId,
    strengths: completedTasks.length > 0 ? [`Demonstrated skill in ${completedTasks[0].title}`] : ['Onboarded successfully'],
    weaknesses: missingSkills.slice(0, 3),
    recommendations: recommendationsList,
    managerFeedback: missingSkills.length > 0 
      ? `Student needs to focus on key areas: ${missingSkills.slice(0, 2).join(', ')}.`
      : `Outstanding performance! Student has met all benchmark expectations.`,
  });
  await feedbackReport.save();

  await SkillGapReport.deleteMany({ studentId });
  const skillGapReport = new SkillGapReport({
    studentId,
    missingSkills,
    detectedSkills,
    gapPercentage,
    generatedAt: new Date(),
  });
  await skillGapReport.save();

  await CareerReport.deleteMany({ studentId });
  const careerReport = new CareerReport({
    studentId,
    readinessScore,
    portfolioScore,
    githubScore,
    careerLevel: readinessScore >= 80 ? 'Industry Ready' : readinessScore >= 60 ? 'Job Ready' : readinessScore >= 40 ? 'Intermediate' : 'Beginner',
    recommendedRoles: [normalizedPath + ' Analyst', normalizedPath + ' Engineer'],
    recommendedSkills: registrySkills,
    recommendedProjects: gaps.slice(0, 2).map(g => g.skill + ' Project'),
    recommendedCertifications,
    salaryRange: '$70,000 - $110,000',
    careerAdvice: missingSkills.length > 0 
      ? `Work on resolving the identified gaps in ${missingSkills.slice(0, 3).join(', ')} by starting new targeted tasks.`
      : `You are in a great position. Focus on obtaining certifications like ${recommendedCertifications.join(', ')}.`,
  });
  await careerReport.save();

  console.log(`[Career Intelligence Engine] Successfully generated dynamic reports for student ${studentId} on path ${normalizedPath}`);

  return {
    feedback: feedbackReport,
    skillGap: skillGapReport,
    career: careerReport,
    skillComparisonData,
    gaps
  };
};

export const checkReportCache = async (studentId) => {
  const latestCareer = await CareerReport.findOne({ studentId }).sort({ updatedAt: -1 });
  if (!latestCareer) return null;

  const latestFeedback = await FeedbackReport.findOne({ studentId }).sort({ updatedAt: -1 });
  if (!latestFeedback) return null;

  const latestSkillGap = await SkillGapReport.findOne({ studentId }).sort({ updatedAt: -1 });
  if (!latestSkillGap) return null;

  const reportTime = latestCareer.updatedAt;

  const latestSub = await Submission.findOne({ studentId }).sort({ updatedAt: -1 });
  if (latestSub && latestSub.updatedAt > reportTime) return null;

  const latestGit = await GithubProfile.findOne({ userId: studentId }).sort({ updatedAt: -1 });
  if (latestGit && latestGit.updatedAt > reportTime) return null;

  const interviews = await Interview.find({ studentId, status: 'completed' });
  const latestIntReport = await InterviewReport.findOne({ interviewId: { $in: interviews.map(i => i._id) } }).sort({ updatedAt: -1 });
  if (latestIntReport && latestIntReport.updatedAt > reportTime) return null;

  return {
    feedback: latestFeedback,
    skillGap: latestSkillGap,
    career: latestCareer,
  };
};
