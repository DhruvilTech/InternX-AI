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

const CORE_TECH_WHITELIST = new Set([
  'javascript', 'typescript', 'react', 'vue', 'angular', 'next.js', 'nuxt.js', 'svelte',
  'node.js', 'node', 'express', 'koa', 'fastapi', 'django', 'flask', 'nest.js', 'nestjs',
  'python', 'java', 'c++', 'c#', 'golang', 'go', 'rust', 'ruby', 'php', 'kotlin', 'swift', 'scala',
  'mongodb', 'postgresql', 'postgres', 'mysql', 'sqlite', 'redis', 'cassandra', 'dynamodb',
  'mariadb', 'oracle', 'sql', 'nosql', 'neo4j', 'influxdb',
  'docker', 'kubernetes', 'k8s', 'terraform', 'ansible', 'jenkins', 'github actions', 'circleci',
  'aws', 'amazon web services', 'google cloud', 'gcp', 'azure', 'heroku', 'vercel', 'netlify',
  'aws glue', 'aws lake formation', 'lake formation', 'apache spark', 'spark', 'hadoop', 'hive',
  'kafka', 'rabbitmq', 'activemq', 'sqs', 'sns',
  'pytorch', 'tensorflow', 'keras', 'scikit-learn', 'pandas', 'numpy', 'scipy', 'matplotlib',
  'langchain', 'pinecone', 'weaviate', 'milvus', 'chromadb', 'huggingface', 'transformers',
  'html', 'css', 'sass', 'less', 'tailwindcss', 'tailwind', 'bootstrap', 'material-ui', 'mui',
  'graphql', 'apollo', 'rest api', 'rest apis', 'rest', 'soap', 'grpc',
  'jest', 'mocha', 'chai', 'cypress', 'selenium', 'junit', 'pytest',
  'git', 'github', 'gitlab', 'bitbucket',
  'jwt', 'oauth', 'oauth2', 'saml', 'okta', 'auth0',
  'system design', 'testing', 'unit testing', 'ci/cd', 'devops', 'microservices', 'serverless',
  'ai/ml'
]);

/**
 * Fallback heuristic report generator
 */
export const getFallbackHeuristicData = (
  studentProfile,
  internship,
  careerPath,
  completedTasks,
  avgTaskScore,
  avgInterviewScore,
  githubProfile,
  missingSkills,
  demonstratedSkills,
  readinessScore
) => {
  let recommendedRoles = [];
  let recommendedCertifications = [];
  let recommendedSkills = [];
  let recommendedProjects = [];
  let salaryRange = '';
  
  const pathClean = (careerPath || 'Backend Developer').toLowerCase();
  
  if (pathClean.includes('ai') || pathClean.includes('machine learning') || pathClean.includes('data science') || pathClean.includes('artificial')) {
    recommendedRoles = ['AI Engineer', 'ML Engineer', 'NLP Specialist', 'AI Software Developer'];
    recommendedCertifications = ['TensorFlow Developer Certificate', 'DeepLearning.AI ML Specialization', 'AWS Machine Learning Specialty'];
    recommendedSkills = ['Vector Databases', 'Transformers', 'LangChain', 'Python'];
    recommendedProjects = ['Real-time Embedding Cache Layer', 'Vector Database Search API', 'LLM Fine-Tuning Pipeline'];
    salaryRange = '$95,000 - $120,000';
  } else if (pathClean.includes('frontend') || pathClean.includes('react') || pathClean.includes('web')) {
    recommendedRoles = ['Frontend Engineer', 'React Developer', 'UI Specialist', 'Full Stack Developer'];
    recommendedCertifications = ['Meta Front-End Developer Professional Certificate', 'AWS Certified Cloud Practitioner'];
    recommendedSkills = ['React', 'JavaScript', 'TailwindCSS', 'Framer Motion'];
    recommendedProjects = ['Interactive Dashboard Widget SDK', 'Tactile Canvas Editor', 'Glassmorphic Component Library'];
    salaryRange = '$75,000 - $95,000';
  } else if (pathClean.includes('cyber') || pathClean.includes('security')) {
    recommendedRoles = ['Cybersecurity Analyst', 'Information Security Engineer', 'Security Consultant'];
    recommendedCertifications = ['CompTIA Security+', 'Certified Ethical Hacker (CEH)', 'Google Cybersecurity Certificate'];
    recommendedSkills = ['Network Security', 'Cryptography', 'Penetration Testing', 'SIEM'];
    recommendedProjects = ['Vulnerability Scanner', 'Intrusion Detection System', 'Encrypted Chat Application'];
    salaryRange = '$80,000 - $105,000';
  } else if (pathClean.includes('data engineer') || pathClean.includes('etl') || pathClean.includes('warehouse') || pathClean.includes('lake') || pathClean.includes('data warehousing') || pathClean.includes('lakehouse')) {
    recommendedRoles = ['Data Engineer', 'Analytics Engineer', 'Big Data Developer', 'ETL Developer'];
    recommendedCertifications = ['Google Cloud Certified Professional Data Engineer', 'AWS Certified Data Engineer - Associate', 'Databricks Certified Professional Data Engineer'];
    recommendedSkills = ['AWS Glue', 'Apache Spark', 'Python', 'SQL', 'Snowflake'];
    recommendedProjects = ['Real-time Event Streaming Pipeline', 'Lakehouse Medallion Data Platform', 'Serverless ETL Orchestrator'];
    salaryRange = '$90,000 - $115,000';
  } else if (pathClean.includes('design') || pathClean.includes('ui') || pathClean.includes('ux') || pathClean.includes('product designer') || pathClean.includes('product design')) {
    recommendedRoles = ['Product Designer', 'UI/UX Designer', 'UX Researcher', 'Interaction Designer'];
    recommendedCertifications = ['Google UX Design Professional Certificate', 'Interaction Design Foundation Certified'];
    recommendedSkills = ['Figma', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems'];
    recommendedProjects = ['Spatially Responsive Canvas Interface', 'Design System Tokens Library', 'Interactive SaaS Dashboard Prototype'];
    salaryRange = '$70,000 - $95,000';
  } else {
    // Default Backend
    recommendedRoles = ['Backend Developer', 'Node.js Engineer', 'API Specialist', 'Software Engineer'];
    recommendedCertifications = ['AWS Developer Associate', 'MongoDB Associate Developer', 'Node.js Certification'];
    recommendedSkills = ['Testing', 'System Design', 'Docker', 'REST API'];
    recommendedProjects = ['Job Portal', 'Microservices Backend', 'Inventory Management System', 'AI Resume Analyzer'];
    salaryRange = '$85,000 - $105,000';
  }


  let strengths = [];
  if (demonstratedSkills.length > 0) {
    strengths.push(`Good implementation of core technologies including ${demonstratedSkills.slice(0, 3).join(', ')}.`);
  } else {
    strengths.push("Good initial understanding of task requirements.");
  }
  if (avgTaskScore > 75) {
    strengths.push("Strong task execution quality and high code compliance.");
  }
  if (githubProfile) {
    strengths.push("Consistent GitHub repository commitment patterns.");
  }

  let weaknesses = [];
  if (missingSkills.length > 0) {
    weaknesses.push(`Lacks demonstrated experience in ${missingSkills.slice(0, 3).join(', ')}.`);
  } else {
    weaknesses.push("Limited project scope demonstration.");
  }
  if (avgTaskScore < 70 && completedTasks.length > 0) {
    weaknesses.push("Inconsistent task score performance requiring closer compliance check.");
  }
  if (!githubProfile) {
    weaknesses.push("Missing integrated GitHub repository trace history.");
  }

  let recommendations = [];
  if (missingSkills.length > 0) {
    recommendations.push(`Build a dedicated sandbox project using ${missingSkills[0]}.`);
  }
  recommendations.push("Conduct mock interviews to refine technical communication flow.");
  if (!githubProfile) {
    recommendations.push("Connect your GitHub profile to unlock repository metrics analytics.");
  }

  let careerAdvice = `Based on your performance diagnostic on the ${careerPath} path, your readiness stands at ${readinessScore}%. `;
  if (missingSkills.length > 0) {
    careerAdvice += `Your largest capability gap is currently in ${missingSkills.slice(0, 2).join(' and ')}. Focus on building targeted projects in these areas. `;
  } else {
    careerAdvice += `You have demonstrated all required baseline skills. Focus on expanding your project complexity and system design skills. `;
  }
  careerAdvice += `We recommend pursuing ${recommendedCertifications[0]} to validate your experience for recruiters.`;

  const roleTitle = internship?.roleTitle || careerPath || 'Software Intern';
  let managerFeedback = `Excellent initiative shown during the sprint tasks as a ${roleTitle}. `;
  if (missingSkills.length > 0) {
    managerFeedback += `To prepare for production workloads, focus on finishing deliverables requiring ${missingSkills.slice(0, 2).join(' and ')}. `;
  } else {
    managerFeedback += `Continue maintaining high code compliance and test coverage setups. `;
  }
  managerFeedback += `Overall, a solid learning journey progress.`;

  let careerLevel = 'Beginner';
  if (readinessScore >= 85) {
    careerLevel = 'Industry Ready';
  } else if (readinessScore >= 70) {
    careerLevel = 'Job Ready';
  } else if (readinessScore >= 45) {
    careerLevel = 'Intermediate';
  }

  return {
    strengths,
    weaknesses,
    recommendations,
    managerFeedback,
    careerLevel,
    recommendedRoles,
    recommendedCertifications,
    salaryRange,
    careerAdvice,
    recommendedSkills,
    recommendedProjects
  };
};

const mapToValidCareerLevel = (level) => {
  const allowed = ['Beginner', 'Intermediate', 'Job Ready', 'Industry Ready', 'Not Enough Data'];
  if (!level) return 'Beginner';
  const clean = level.trim();
  if (allowed.includes(clean)) return clean;
  
  // Normalization mapping
  const lower = clean.toLowerCase();
  if (lower.includes('not enough data') || lower.includes('insufficient')) return 'Not Enough Data';
  if (lower.includes('begin') || lower.includes('entry') || lower.includes('junior')) return 'Beginner';
  if (lower.includes('inter') || lower.includes('mid')) return 'Intermediate';
  if (lower.includes('job') || lower.includes('ready')) return 'Job Ready';
  if (lower.includes('industry') || lower.includes('senior') || lower.includes('expert')) return 'Industry Ready';
  
  return 'Beginner'; // Safe fallback
};

/**
 * Interfaces with Groq completions endpoint to generate a report.
 */
const callGroqForReport = async (
  studentProfile,
  internship,
  careerPath,
  tasks,
  avgTaskScore,
  avgInterviewScore,
  githubProfile,
  missingSkills,
  demonstratedSkills,
  readinessScore
) => {
  const systemPrompt = `You are an AI Career Intelligence Coach and Tech Recruiter.
Based on the student's metrics, task submissions, GitHub profile, and mock interview scores, you must generate a constructive, realistic evaluation report.
You must return a raw JSON object matching the following structure:
{
  "strengths": [String],
  "weaknesses": [String],
  "recommendations": [String],
  "managerFeedback": String,
  "careerLevel": String,
  "recommendedRoles": [String],
  "recommendedCertifications": [String],
  "recommendedSkills": [String],
  "recommendedProjects": [String],
  "salaryRange": String,
  "careerAdvice": String
}
CRITICAL CRITERIA:
- "careerLevel" must strictly be one of: "Beginner", "Intermediate", "Job Ready", "Industry Ready". Do not use any other values.
- Do not mention LangChain, Prometheus, or PyTorch unless they exist in missingSkills or demonstratedSkills.
- Skill gaps/weaknesses should focus strictly on the missing skills: ${JSON.stringify(missingSkills)}.
- The recommended roles and certifications must match the career path: ${careerPath}.
- Format the response as standard parseable JSON. Do not include markdown code block syntax.`;

  const userPrompt = `
Student: ${studentProfile?.fullName}
Career Track: ${careerPath}
Internship Department: ${internship?.department || 'N/A'}
Internship Industry: ${internship?.industry || 'N/A'}
Readiness Score: ${readinessScore}%
Task Average Score: ${avgTaskScore}%
Interview Average Score: ${avgInterviewScore || 'N/A'}%
GitHub Repos Count: ${githubProfile?.publicRepos || 0}
Demonstrated Skills: ${JSON.stringify(demonstratedSkills)}
Missing Required Skills: ${JSON.stringify(missingSkills)}
  `;

  const parsedJson = await callGroq({
    model: 'qwen/qwen3-32b',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.3,
    jsonMode: true
  });

  return parsedJson;
};

/**
 * Main service to compile career report details and update reports database.
 */
export const generateCareerReports = async (studentId) => {
  const user = await User.findById(studentId);
  if (!user) throw new Error('User not found');

  const studentProfile = await Student.findOne({ userId: studentId });
  const internship = await Internship.findOne({ studentId });
  const tasks = await Task.find({ studentId });
  const studentCareer = await StudentCareer.findOne({ studentId }).populate('careerId');
  
  // Calculate career path
  let careerPath = 'Backend Developer';
  if (internship?.internshipRole) {
    careerPath = internship.internshipRole;
  } else if (internship?.roleTitle) {
    careerPath = internship.roleTitle;
  } else if (studentCareer?.careerId?.title) {
    careerPath = studentCareer.careerId.title;
  }

  // Calculate required skills
  const fallbackRequiredSkills = studentCareer?.careerId?.requiredSkills || [];
  const requiredSkills = internship?.technicalRequirements?.length 
    ? internship.technicalRequirements 
    : (fallbackRequiredSkills.length ? fallbackRequiredSkills : ['JavaScript', 'Node.js', 'MongoDB', 'React', 'REST APIs']);

  // Extract demonstrated skills
  const submissions = await Submission.find({ studentId });
  const githubContributions = await GithubContribution.find({ userId: studentId });
  const githubProfile = await GithubProfile.findOne({ userId: studentId });

  const demonstratedSkills = new Set();
  const addIfAllowed = (skill) => {
    if (!skill) return;
    const clean = skill.trim();
    if (CORE_TECH_WHITELIST.has(clean.toLowerCase()) || 
        requiredSkills.some(req => req.toLowerCase() === clean.toLowerCase())) {
      demonstratedSkills.add(clean);
    }
  };

  // Helper to map technologies to canonical whitelisted skills
  const mapTechnologyToCanonical = (tech) => {
    const t = tech.toLowerCase().trim();
    if (t === 'react' || t.includes('reactjs') || t.includes('react.js')) return 'React';
    if (t === 'node' || t === 'node.js' || t === 'nodejs') return 'Node.js';
    if (t === 'mongodb' || t === 'mongo') return 'MongoDB';
    if (t === 'python' || t === 'py') return 'Python';
    if (t === 'java' && t !== 'javascript') return 'Java';
    if (t === 'typescript' || t === 'ts') return 'TypeScript';
    if (t === 'docker') return 'Docker';
    if (t === 'ai' || t === 'ml' || t.includes('pytorch') || t.includes('tensorflow') || t.includes('huggingface') || t.includes('transformers') || t.includes('machine learning') || t.includes('artificial intelligence')) return 'AI/ML';
    return null;
  };

  const completedTasks = tasks.filter(t => t.status === 'completed');
  completedTasks.forEach(t => {
    if (t.requiredSkills) {
      t.requiredSkills.forEach(s => addIfAllowed(s));
    }
  });
  submissions.forEach(sub => {
    if (sub.extractedMetadata?.technologies) {
      sub.extractedMetadata.technologies.forEach(t => {
        addIfAllowed(t);
        const mapped = mapTechnologyToCanonical(t);
        if (mapped) addIfAllowed(mapped);
      });
    }
  });
  githubContributions.forEach(c => {
    if (c.languageBreakdown) {
      Object.keys(c.languageBreakdown).forEach(lang => {
        addIfAllowed(lang);
        const mapped = mapTechnologyToCanonical(lang);
        if (mapped) addIfAllowed(mapped);
      });
    }
  });
  if (studentProfile?.skills) {
    studentProfile.skills.forEach(s => {
      addIfAllowed(s);
      const mapped = mapTechnologyToCanonical(s);
      if (mapped) addIfAllowed(mapped);
    });
  }

  const demonstratedArray = Array.from(demonstratedSkills);
  
  // Calculate missing skills (requiredSkills minus demonstratedSkills)
  const missingSkills = requiredSkills.filter(reqSkill => 
    !demonstratedArray.some(demSkill => demSkill.toLowerCase() === reqSkill.toLowerCase())
  );

  const gapPercentage = Math.round((missingSkills.length / Math.max(requiredSkills.length, 1)) * 100);

  // Fetch all evaluations for all submissions by this student
  const allSubIds = submissions.map(s => s._id);
  const allEvaluations = await Evaluation.find({ submissionId: { $in: allSubIds } });

  // 1. Task Completion Score (taskCompletion)
  const totalTasks = tasks.length;
  const completedTasksCount = completedTasks.length;
  const taskCompletion = totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 0;

  // 2. Submission Quality Score (submissionQuality)
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

  // 3. GitHub Score (githubScore)
  let githubScore = 0;
  const githubSubmissions = submissions.filter(s => s.submissionType === 'github');
  if (githubProfile && githubSubmissions.length > 0) {
    const gitSubIds = githubSubmissions.map(s => s._id);
    const gitEvaluations = allEvaluations.filter(e => gitSubIds.some(id => id.toString() === e.submissionId.toString()));
    if (gitEvaluations.length > 0) {
      const sumGithubScores = gitEvaluations.reduce((acc, e) => acc + (e.githubScore || e.repositoryScore || 0), 0);
      githubScore = Math.round(sumGithubScores / gitEvaluations.length);
    }
  }

  // 4. Interview Score (interviewScore)
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

  // 6. Placement Ready Score (readinessScore)
  const skillCoverage = requiredSkills.length > 0 
    ? Math.round(((requiredSkills.length - missingSkills.length) / requiredSkills.length) * 100) 
    : 0;
  const internshipProgress = taskCompletion;
  let readinessScore = (portfolioScore * 0.40) + (skillCoverage * 0.20) + (internshipProgress * 0.20) + (interviewScore * 0.20);
  readinessScore = Math.min(100, Math.max(0, Math.round(readinessScore)));

  // Insufficient Data Check
  const noEvaluations = allEvaluations.length === 0;
  const noSubmissions = submissions.length === 0;
  const noInterviews = interviewReports.length === 0;
  const hasInsufficientData = noEvaluations && noSubmissions && noInterviews;

  if (hasInsufficientData) {
    portfolioScore = 0;
    readinessScore = 0;
  }

  // Generate metrics
  let reportData;
  if (hasInsufficientData) {
    reportData = {
      strengths: [],
      weaknesses: [],
      recommendations: [],
      managerFeedback: "Not enough tasks completed or evaluations conducted yet.",
      careerLevel: "Not Enough Data",
      recommendedRoles: [],
      recommendedCertifications: [],
      recommendedSkills: [],
      recommendedProjects: [],
      salaryRange: "N/A",
      careerAdvice: "Please submit tasks and link your GitHub repository to generate career insights."
    };
  } else {
    // Compute temporary average task score for heuristic reports
    const avgTaskScore = completedTasks.length > 0
      ? completedTasks.reduce((acc, t) => acc + (t.score || 0), 0) / completedTasks.length
      : 0;
    const avgInterviewScore = interviewScore;

    const isMock = !process.env.GROQ_API_KEY;
    if (!isMock) {
      try {
        reportData = await callGroqForReport(
          studentProfile,
          internship,
          careerPath,
          tasks,
          avgTaskScore,
          avgInterviewScore,
          githubProfile,
          missingSkills,
          demonstratedArray,
          readinessScore
        );
      } catch (err) {
        console.error('[AI Career Report] Groq failed, using heuristic fallback:', err.message);
        reportData = getFallbackHeuristicData(
          studentProfile,
          internship,
          careerPath,
          completedTasks,
          avgTaskScore,
          avgInterviewScore,
          githubProfile,
          missingSkills,
          demonstratedArray,
          readinessScore
        );
      }
    } else {
      reportData = getFallbackHeuristicData(
        studentProfile,
        internship,
        careerPath,
        completedTasks,
        avgTaskScore,
        avgInterviewScore,
        githubProfile,
        missingSkills,
        demonstratedArray,
        readinessScore
      );
    }
  }

  // Save/Update in database collections
  
  // 1. Save feedback_reports
  await FeedbackReport.deleteMany({ studentId });
  const feedbackReport = new FeedbackReport({
    studentId,
    strengths: reportData.strengths,
    weaknesses: reportData.weaknesses,
    recommendations: reportData.recommendations,
    managerFeedback: reportData.managerFeedback,
  });
  await feedbackReport.save();

  // 2. Save skill_gap_reports
  await SkillGapReport.deleteMany({ studentId });
  const skillGapReport = new SkillGapReport({
    studentId,
    missingSkills,
    detectedSkills: demonstratedArray,
    gapPercentage,
    generatedAt: new Date(),
  });
  await skillGapReport.save();

  // 3. Save career_reports
  await CareerReport.deleteMany({ studentId });
  const careerReport = new CareerReport({
    studentId,
    readinessScore,
    portfolioScore,
    githubScore,
    careerLevel: mapToValidCareerLevel(reportData.careerLevel),
    recommendedRoles: reportData.recommendedRoles,
    recommendedSkills: reportData.recommendedSkills || [],
    recommendedProjects: reportData.recommendedProjects || [],
    recommendedCertifications: reportData.recommendedCertifications,
    salaryRange: reportData.salaryRange,
    careerAdvice: reportData.careerAdvice,
  });
  await careerReport.save();

  console.log(`[Career Intelligence Engine] Successfully generated dynamic reports for student ${studentId}`);
  
  return {
    feedback: feedbackReport,
    skillGap: skillGapReport,
    career: careerReport,
  };
};

/**
 * Cache validator helper checks timestamps of source elements against report generated time
 */
export const checkReportCache = async (studentId) => {
  const latestCareer = await CareerReport.findOne({ studentId }).sort({ updatedAt: -1 });
  if (!latestCareer) return null; // No cache

  const latestFeedback = await FeedbackReport.findOne({ studentId }).sort({ updatedAt: -1 });
  if (!latestFeedback) return null;

  const latestSkillGap = await SkillGapReport.findOne({ studentId }).sort({ updatedAt: -1 });
  if (!latestSkillGap) return null;

  const reportTime = latestCareer.updatedAt;

  // Check submissions
  const latestSub = await Submission.findOne({ studentId }).sort({ updatedAt: -1 });
  if (latestSub && latestSub.updatedAt > reportTime) return null;

  // Check github profile
  const latestGit = await GithubProfile.findOne({ userId: studentId }).sort({ updatedAt: -1 });
  if (latestGit && latestGit.updatedAt > reportTime) return null;

  // Check interview reports
  const interviews = await Interview.find({ studentId, status: 'completed' });
  const latestIntReport = await InterviewReport.findOne({ interviewId: { $in: interviews.map(i => i._id) } }).sort({ updatedAt: -1 });
  if (latestIntReport && latestIntReport.updatedAt > reportTime) return null;

  return {
    feedback: latestFeedback,
    skillGap: latestSkillGap,
    career: latestCareer,
  };
};
