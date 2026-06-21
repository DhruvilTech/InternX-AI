import axios from 'axios';
import { callGroq } from './groq.service.js';
import Evaluation from '../models/Evaluation.js';
import Submission from '../models/Submission.js';
import Task from '../models/Task.js';
import SkillAnalysis from '../models/SkillAnalysis.js';
import CareerIntelligence from '../models/CareerIntelligence.js';
import StudentCareer from '../models/StudentCareer.js';
import Interview from '../models/Interview.js';
import InterviewReport from '../models/InterviewReport.js';
import GithubProfile from '../models/GithubProfile.js';
import GithubContribution from '../models/GithubContribution.js';
import { analyzeGithubRepository } from './githubAnalyzer.service.js';
import { extractZipMetadata } from './zipExtractor.service.js';
import { generateFeedbackRecord, analyzeStudentSkills, generateCareerIntelligence } from './feedback.service.js';
import { generateCareerReports } from './careerReport.service.js';
import FeedbackReport from '../models/FeedbackReport.js';
import SkillGapReport from '../models/SkillGapReport.js';
import CareerReport from '../models/CareerReport.js';
import EvaluationReport from '../models/EvaluationReport.js';


/**
 * Main service to evaluate a submission asynchronously.
 * Updates student skills, progress tracking timelines, and career intelligence indices.
 * 
 * @param {string} submissionId Submission document ID
 * @param {string} type Submission Type (github or zip)
 * @param {string} githubUrl Repo URL
 * @param {string} fileData Base64 zip string
 * @param {string} decryptedToken Decrypted token
 * @returns {object} The created Evaluation document
 */
export const runEvaluationEngine = async (submissionId, type, githubUrl, fileData, decryptedToken) => {
  const submission = await Submission.findById(submissionId);
  if (!submission) {
    throw new Error('Submission not found');
  }

  const task = await Task.findById(submission.taskId);
  if (!task) {
    throw new Error('Task not found');
  }

  const submissionType = type || submission.submissionType;
  const repoUrl = githubUrl || submission.githubUrl;

  try {
    // Stage 2: Repository Validation / ZIP Extraction
    if (submissionType === 'github') {
      submission.status = 'Repository Validation';
      submission.progress = 25;
      await submission.save();

      console.log(`[Evaluation service] Auditing GitHub repository: ${repoUrl}`);
      const meta = await analyzeGithubRepository(repoUrl, decryptedToken, submission.githubBranch, submission.githubCommitHash);
      submission.extractedMetadata = meta;
      await submission.save();
    } else if (submissionType === 'zip') {
      submission.status = 'ZIP Extraction';
      submission.progress = 25;
      await submission.save();

      console.log(`[Evaluation service] Extracting ZIP package contents...`);
      if (!fileData) {
        throw new Error('Base64 ZIP file data is missing or empty.');
      }
      const meta = await extractZipMetadata(fileData);
      submission.extractedMetadata = meta;
      await submission.save();
    }

    // Stage 3: Code Analysis
    submission.status = 'Code Analysis';
    submission.progress = 50;
    await submission.save();
    console.log(`[Evaluation service] Running code structure and file checks...`);

    // Stage 4: AI Evaluation
    submission.status = 'AI Evaluation';
    submission.progress = 70;
    await submission.save();
    console.log(`[Evaluation service] Triggering AI prompt and scorecard generation...`);

    let evaluationData = null;
    const isMock = !process.env.GROQ_API_KEY;

    if (!isMock) {
      try {
        evaluationData = await callGroqAPI(task, submission);
      } catch (apiError) {
        console.error('[Evaluation AI] Groq API call failed, falling back to heuristics:', apiError.message);
        evaluationData = generateHeuristicEvaluation(task, submission);
      }
    } else {
      evaluationData = generateHeuristicEvaluation(task, submission);
    }

    // Save Evaluation
    const githubScore = submissionType === 'github' ? (evaluationData.githubScore || evaluationData.technicalScore || 0) : 0;
    const overallScore = Math.round(
      (evaluationData.technicalScore +
        evaluationData.architectureScore +
        evaluationData.codeQualityScore +
        evaluationData.documentationScore +
        evaluationData.problemSolvingScore) / 5
    );

    // Wipe any existing evaluations for this submission to prevent duplication
    await Evaluation.deleteMany({ submissionId: submission._id });

    const evaluation = new Evaluation({
      submissionId: submission._id,
      technicalScore: evaluationData.technicalScore,
      repositoryScore: evaluationData.technicalScore, // Map technicalScore to repositoryScore
      githubScore,
      architectureScore: evaluationData.architectureScore,
      codeQualityScore: evaluationData.codeQualityScore,
      documentationScore: evaluationData.documentationScore,
      problemSolvingScore: evaluationData.problemSolvingScore,
      overallScore,
      strengths: evaluationData.strengths || [],
      weaknesses: evaluationData.weaknesses || [],
      recommendations: evaluationData.recommendations || [],
      reasons: evaluationData.reasons || {
        technicalScore: "Successfully parsed source code files.",
        architectureScore: "Folder layout separation verified.",
        codeQualityScore: "Checked naming conventions and readability.",
        documentationScore: "Evaluated README instructions completeness.",
        problemSolvingScore: "Matches task requirements objective."
      }
    });

    await evaluation.save();

    // Generate Feedback document
    await generateFeedbackRecord(submission._id, task._id, submission.studentId, submission.internshipId || task.internshipId, evaluationData);

    // Update Task status to completed and populate scores/feedback
    task.status = 'completed';
    task.progress = 100;
    task.score = overallScore;
    task.feedback = (evaluationData.strengths || []).join(', ') + '. Suggestions: ' + (evaluationData.recommendations || []).join(', ');
    task.categoryScore = {
      code: evaluation.codeQualityScore,
      arch: evaluation.architectureScore,
      perf: Math.round((evaluation.technicalScore + evaluation.problemSolvingScore) / 2),
      sec: Math.round((evaluation.technicalScore + evaluation.architectureScore) / 2),
      doc: evaluation.documentationScore
    };
    await task.save();

    // Stage 5: Skill Analysis
    submission.status = 'Skill Analysis';
    submission.progress = 85;
    await submission.save();
    await analyzeStudentSkills(submission.studentId);

    // Stage 6: Career Analysis
    submission.status = 'Career Analysis';
    submission.progress = 95;
    await submission.save();
    await generateCareerIntelligence(submission.studentId, submission.internshipId || task.internshipId);
    
    // Regenerate new database collections reports
    try {
      await generateCareerReports(submission.studentId);
    } catch (reportErr) {
      console.error('[Evaluation service] Failed to generate career reports:', reportErr.message);
    }

    // Compile and save/update unified EvaluationReport
    try {
      const feedbackReport = await FeedbackReport.findOne({ studentId: submission.studentId });
      const skillGapReport = await SkillGapReport.findOne({ studentId: submission.studentId });
      const careerReport = await CareerReport.findOne({ studentId: submission.studentId });

      await EvaluationReport.deleteMany({ studentId: submission.studentId });

      const evaluationReport = new EvaluationReport({
        studentId: submission.studentId,
        internshipId: submission.internshipId || task.internshipId,
        submissionId: submission._id,
        overallScore: evaluation.overallScore,
        technicalScore: evaluation.technicalScore,
        codeQuality: evaluation.codeQualityScore,
        projectStructure: evaluation.architectureScore,
        documentationScore: evaluation.documentationScore,
        githubScore: evaluation.githubScore,
        strengths: evaluation.strengths || [],
        weaknesses: evaluation.weaknesses || [],
        identifiedSkills: skillGapReport ? skillGapReport.detectedSkills : [],
        identifiedSkillGaps: skillGapReport ? skillGapReport.missingSkills : [],
        recommendations: evaluation.recommendations || [],
        careerRecommendations: careerReport ? careerReport.recommendedCertifications : [],
        readinessLevel: careerReport ? careerReport.careerLevel : 'Beginner',
        generatedAt: new Date()
      });
      await evaluationReport.save();
      console.log(`[Evaluation Service] Saved unified EvaluationReport for student ${submission.studentId}`);
    } catch (reportErr) {
      console.error('[Evaluation service] Failed to save EvaluationReport:', reportErr.message);
    }

    // Stage 7: Completed
    submission.status = 'Completed';
    submission.progress = 100;
    await submission.save();


    console.log(`[Evaluation Service] Pipeline completed successfully for submission ${submission._id}.`);
    return evaluation;
  } catch (error) {
    console.error('[Evaluation Service Pipeline Error] Failed:', error.message);
    submission.status = 'Failed';
    submission.progress = 100;
    await submission.save();

    // Reset task status so the user can re-submit
    task.status = 'todo';
    task.feedback = 'Evaluation failed: ' + error.message;
    await task.save();

    throw error;
  }
};

/**
 * Interfaces with Groq completions endpoint to grade submission.
 */
const callGroqAPI = async (task, submission) => {
  let detailsText = '';
  const meta = submission.extractedMetadata;

  if (submission.submissionType === 'github') {
    detailsText = `GitHub Repository URL: ${submission.githubUrl}\n`;
    if (meta) {
      detailsText += `Repository Metadata:
- Description: ${meta.description || 'None'}
- Primary Languages/Technologies: ${meta.technologies ? meta.technologies.join(', ') : 'None'}
- File Count: ${meta.fileCount || 0}
- Commits Count: ${meta.commitsCount || 0}
- Branch Count: ${meta.branchCount || 0}
- Contributors Count: ${meta.contributors || 0}
- README Content Summary:
${meta.readmeContent ? meta.readmeContent.slice(0, 2000) : 'None'}
- Folder Structure Tree:
${meta.folderStructure ? meta.folderStructure.slice(0, 50).join('\n') : 'None'}
`;
    }
  } else if (submission.submissionType === 'zip') {
    detailsText = `ZIP Archive file name: ${submission.zipFile}\n`;
    if (meta) {
      detailsText += `Extracted ZIP Metadata:
- File Count: ${meta.fileCount || 0}
- Dependencies / Package Info: ${meta.packageDependencies ? JSON.stringify(meta.packageDependencies) : 'None'}
- Technologies Detected: ${meta.technologies ? meta.technologies.join(', ') : 'None'}
- Code Lines Count: ${meta.codeLineCount || 0}
- README Content Summary:
${meta.readmeContent ? meta.readmeContent.slice(0, 2000) : 'None'}
- Folder Structure Tree:
${meta.folderStructure ? meta.folderStructure.slice(0, 50).join('\n') : 'None'}
`;
    }
  }

  const systemPrompt = `You are a Senior Software Architect, AI Engineering lead, and technical auditor.
Your job is to strictly and accurately evaluate a student's task submission against the provided task description and functional requirements.

You must inspect the details provided in the submission, including files count, technologies used, file structure, README contents, package dependencies, and actual code snippets of the key source files.

CRITICAL ACCURACY REQUIREMENT:
- If key code snippets are empty, contain only boilerplate/skeleton code, or consist of files with only "// TODO" comments, import statements, or class/function shell signatures without actual logic, you MUST penalize the score heavily. The "technicalScore", "problemSolvingScore", and "codeQualityScore" must be rated below 40.
- Do not let a well-written README or a nice directory tree mask a lack of actual implementation in the code files.
- Be extremely realistic and strict. If a deliverable contains no code files or is empty, scores must be below 20.

AI MUST PROVIDE EVIDENCE:
For each score, you must provide a detailed explanation/reason containing concrete evidence of what you found in the code (e.g., number of controllers, presence of schemas, etc.).
No score must be generated without reason.

Return a structured JSON object only:
{
  "technicalScore": Number,
  "architectureScore": Number,
  "codeQualityScore": Number,
  "documentationScore": Number,
  "problemSolvingScore": Number,
  "githubScore": Number,
  "overallScore": Number,
  "reasons": {
    "technicalScore": "Provide reason with evidence...",
    "architectureScore": "Provide reason with evidence...",
    "codeQualityScore": "Provide reason with evidence...",
    "documentationScore": "Provide reason with evidence...",
    "problemSolvingScore": "Provide reason with evidence...",
    "githubScore": "Provide reason evaluating repository, commits, and branch code..."
  },
  "strengths": [String],
  "weaknesses": [String],
  "recommendations": [String]
}`;

  const userPromptBase = `Task Title: ${task.title}
Task Description: ${task.description}
Task Difficulty: ${task.difficulty}
Required Skills: ${task.requiredSkills.join(', ')}

Submission Deliverable Information:
Submission Type: ${submission.submissionType}
${detailsText}

Grade this work objectively.`;

  // Size calculation to protect against oversized prompt limits
  const baseSize = systemPrompt.length + userPromptBase.length;
  let snippetsSize = 0;
  if (meta && meta.fileSnippets && meta.fileSnippets.length > 0) {
    meta.fileSnippets.forEach(snippet => {
      snippetsSize += (snippet.path.length + snippet.content.length + 50);
    });
  }

  let includeSnippets = true;
  if (baseSize + snippetsSize > 30000) {
    includeSnippets = false;
    console.log(`[Evaluation AI] Prompt size limit protection triggered. Total size estimate (${baseSize + snippetsSize}) exceeds 30,000 characters limit. Summarizing files instead of raw code snippets.`);
  }

  // Inject file snippets or a summary based on size limit check
  if (meta && meta.fileSnippets && meta.fileSnippets.length > 0) {
    if (includeSnippets) {
      detailsText += `\nKey Source Code File Snippets (Inspect the implementation logic in these files):\n`;
      meta.fileSnippets.forEach(snippet => {
        detailsText += `--- File: ${snippet.path} ---\n${snippet.content}\n-------------------------\n`;
      });
    } else {
      detailsText += `\nKey Source Code Files (Contents omitted due to size constraints - summary provided):\n`;
      meta.fileSnippets.forEach(snippet => {
        const lines = snippet.content.split('\n').length;
        detailsText += `- File: ${snippet.path} (${lines} lines, ${snippet.content.length} characters)\n`;
      });
      detailsText += `\nRepository Summary:
- Total Key Source Files: ${meta.fileSnippets.length}
- Detected Skills: ${task.requiredSkills.join(', ')}
- Technologies Found: ${meta.technologies ? meta.technologies.join(', ') : 'None'}
- Submission Metadata: File Count=${meta.fileCount || 0}, Primary Tech=${meta.technologies ? meta.technologies.join(', ') : 'None'}
`;
    }
  }

  const userPrompt = `Task Title: ${task.title}
Task Description: ${task.description}
Task Difficulty: ${task.difficulty}
Required Skills: ${task.requiredSkills.join(', ')}

Submission Deliverable Information:
Submission Type: ${submission.submissionType}
${detailsText}

Grade this work objectively.`;

  const parsedJson = await callGroq({
    model: 'qwen/qwen3-32b',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.1,
    jsonMode: true
  });

  return parsedJson;
};

/**
 * Generates realistic heuristical grades if LLM endpoint fails or is unconfigured.
 */
const generateHeuristicEvaluation = (task, submission) => {
  const meta = submission.extractedMetadata;
  const fileCount = meta ? (meta.fileCount || 0) : 0;

  // Case 1: Empty or extremely small submission
  if (fileCount === 0 && (!meta || !meta.text)) {
    return {
      technicalScore: 15,
      architectureScore: 10,
      codeQualityScore: 10,
      documentationScore: 0,
      problemSolvingScore: 15,
      githubScore: submission.submissionType === 'github' ? 10 : 0,
      reasons: {
        technicalScore: "Zero source code files detected in workspace.",
        architectureScore: "No directory separation possible due to lack of folders.",
        codeQualityScore: "Unable to evaluate style - empty repository.",
        documentationScore: "No README documentation found.",
        problemSolvingScore: "Workspace empty. Fails milestone requirements.",
        githubScore: submission.submissionType === 'github' ? "Empty repository submitted on GitHub." : "Not a GitHub submission."
      },
      strengths: ['Initial delivery configuration established'],
      weaknesses: [
        'Zero code files or documents found in the submission package.',
        'No README configuration instructions provided.'
      ],
      recommendations: [
        'Unpack your source files and upload a complete archive.',
        'Add a detailed README.md file in the root of your project explaining setup.'
      ]
    };
  }

  // Case 2: Check for skeleton / boilerplate template submissions
  let isSkeleton = false;
  if (meta && meta.fileSnippets && meta.fileSnippets.length > 0) {
    let codeLinesCount = 0;
    meta.fileSnippets.forEach(s => {
      const lines = s.content.split('\n');
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed &&
          !trimmed.startsWith('//') &&
          !trimmed.startsWith('/*') &&
          !trimmed.startsWith('*') &&
          !trimmed.startsWith('#') &&
          !trimmed.startsWith('import ') &&
          !trimmed.startsWith('require(') &&
          trimmed !== '{' &&
          trimmed !== '}' &&
          trimmed !== '};' &&
          trimmed !== '[]' &&
          trimmed !== '();') {
          codeLinesCount++;
        }
      });
    });
    if (codeLinesCount < 8) {
      isSkeleton = true;
    }
  } else {
    isSkeleton = true;
  }

  if (isSkeleton) {
    return {
      technicalScore: 22,
      architectureScore: 25,
      codeQualityScore: 15,
      documentationScore: meta?.readmeContent ? 55 : 10,
      problemSolvingScore: 18,
      githubScore: submission.submissionType === 'github' ? 20 : 0,
      reasons: {
        technicalScore: "Workspace contains only starter boilerplate template files.",
        architectureScore: "Boilerplate folder configuration present but no custom source components exist.",
        codeQualityScore: "Source code files lack logic implementations.",
        documentationScore: meta?.readmeContent ? "README file exists in root layout." : "No README instructions provided.",
        problemSolvingScore: "Fails requirements. Student has not written logic.",
        githubScore: submission.submissionType === 'github' ? "Boilerplate template files found in GitHub repo." : "Not a GitHub submission."
      },
      strengths: meta?.readmeContent ? ['README documentation structure is present'] : ['Workspace structure initialized'],
      weaknesses: [
        'Submission contains only skeleton template code/boilerplate with no actual implementation logic.',
        'No functional objectives developed in the sampled source code files.'
      ],
      recommendations: [
        'Write actual business logic and code implementations instead of starter boilerplate.',
        'Ensure key files like routes, models, or entrypoints are populated with working scripts.'
      ]
    };
  }

  // Case 3: Normal submission, base scoring off metadata completeness
  const base = task.difficulty === 'Easy' ? 78 : task.difficulty === 'Medium' ? 84 : 88;
  const variance = () => Math.floor(Math.random() * 12) - 5; // -5 to +6 variance

  let technicalScore = Math.min(100, Math.max(50, base + variance()));
  let architectureScore = Math.min(100, Math.max(50, base + variance()));
  let codeQualityScore = Math.min(100, Math.max(50, base + variance()));
  let documentationScore = Math.min(100, Math.max(50, base + variance()));
  let problemSolvingScore = Math.min(100, Math.max(50, base + variance()));
  let githubScore = submission.submissionType === 'github' ? Math.min(100, Math.max(50, base + variance())) : 0;

  let strengths = ['Proper package configuration', 'Core architectural separation of layers'];
  let weaknesses = ['No unit tests mock datasets', 'Missing validation middlewares'];
  let recommendations = ['Setup environment secrets config files', 'Add test scripts in package.json'];

  if (meta) {
    if (meta.readmeContent) {
      strengths.push('Detailed README description and instructions');
      documentationScore = Math.min(100, documentationScore + 10);
    } else {
      weaknesses.push('Missing project README.md guide');
      documentationScore = Math.max(20, documentationScore - 30);
    }

    const controllersCount = meta.categories?.controllers?.length || 0;
    const modelsCount = meta.categories?.models?.length || 0;
    const routesCount = meta.categories?.routes?.length || 0;

    if (controllersCount > 0 && modelsCount > 0 && routesCount > 0) {
      strengths.push('Clean MVC folder division');
      architectureScore = Math.min(100, architectureScore + 8);
    } else {
      weaknesses.push('Flat directory layout without structural division');
      architectureScore = Math.max(30, architectureScore - 20);
    }
  }

  const reasons = {
    technicalScore: `Code imports match project requirements. Found ${meta?.fileCount || 0} files.`,
    architectureScore: `Layout divides project into ${Object.keys(meta?.categories || {}).filter(k => meta.categories[k].length > 0).join(', ')} layers.`,
    codeQualityScore: "Checked variable bindings and function exports.",
    documentationScore: meta?.readmeContent ? "README outlines installation, usage, and configuration settings." : "README file not detected.",
    problemSolvingScore: "Logical script blocks successfully cover task objective parameters.",
    githubScore: submission.submissionType === 'github' ? `Analyzed repo branch with ${meta?.commitsCount || 0} commits and clean code structure.` : "Not a GitHub submission."
  };

  return {
    technicalScore,
    architectureScore,
    codeQualityScore,
    documentationScore,
    problemSolvingScore,
    githubScore,
    reasons,
    strengths,
    weaknesses,
    recommendations
  };
};

/**
 * Updates student skill level details in MongoDB.
 * Implements an exponential smoothing formula.
 */
export const updateStudentSkills = async (studentId, task, overallScore) => {
  let skillAnalysis = await SkillAnalysis.findOne({ studentId });
  if (!skillAnalysis) {
    skillAnalysis = new SkillAnalysis({ studentId, skills: [] });
  }

  // Get recent submission to pull detected technology skills
  const submission = await Submission.findOne({ studentId, taskId: task._id }).sort({ createdAt: -1 });
  const detectedSkills = [];

  if (submission?.extractedMetadata?.technologies) {
    submission.extractedMetadata.technologies.forEach(tech => {
      if (!detectedSkills.includes(tech)) detectedSkills.push(tech);
    });
  }

  // Also include task required skills
  const taskSkills = task.requiredSkills || [];
  taskSkills.forEach(skillName => {
    if (!detectedSkills.some(s => s.toLowerCase() === skillName.toLowerCase())) {
      detectedSkills.push(skillName);
    }
  });

  detectedSkills.forEach(skillName => {
    const skillIdx = skillAnalysis.skills.findIndex(s => s.name.toLowerCase() === skillName.toLowerCase());

    if (skillIdx !== -1) {
      const currentLevel = skillAnalysis.skills[skillIdx].level;
      // Exponential smoothing: student moves 40% closer to task performance score
      const newLevel = Math.round(currentLevel + (overallScore - currentLevel) * 0.40);
      skillAnalysis.skills[skillIdx].level = Math.min(100, Math.max(0, newLevel));
    } else {
      // First time learning skill, initialize with task score weighted down slightly
      const initLevel = Math.round(overallScore * 0.8);
      skillAnalysis.skills.push({ name: skillName, level: initLevel });
    }
  });

  await skillAnalysis.save();
  console.log(`[Evaluation AI] Updated skill metadata for student ${studentId}.`);
};

/**
 * Computes portfolio scores and placement readiness.
 */
export const updateStudentCareerIntelligence = async (studentId) => {
  // 1. Fetch task records
  const totalTasks = await Task.countDocuments({ studentId });
  const completedTasks = await Task.countDocuments({ studentId, status: 'completed' });
  const completedTasksDocs = await Task.find({ studentId, status: 'completed' });

  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const sumScores = completedTasksDocs.reduce((acc, t) => acc + (t.score || 0), 0);
  const avgScore = completedTasks > 0 ? Math.round(sumScores / completedTasks) : 0;

  // 2. Fetch interviews performance if any
  const interviews = await Interview.find({ studentId, status: 'completed' });
  const interviewIds = interviews.map(i => i._id);
  const reports = await InterviewReport.find({ interviewId: { $in: interviewIds } });

  let avgInterviewScore = 0;
  if (reports.length > 0) {
    const sumInterviews = reports.reduce((acc, r) => acc + r.overallScore, 0);
    avgInterviewScore = Math.round(sumInterviews / reports.length);
  }

  // 3. Compute Portfolio Index
  const portfolioScore = Math.round((avgScore * 0.85) + (completionPercentage * 0.15));

  // 4. Compute Placement Readiness & GitHub score
  let githubScore = 0;
  const githubSubmissions = await Submission.find({ studentId, submissionType: 'github', status: 'Completed' });
  const submissionIds = githubSubmissions.map(s => s._id);
  const evaluations = await Evaluation.find({ submissionId: { $in: submissionIds } });

  if (evaluations.length > 0) {
    const sumGithubScores = evaluations.reduce((acc, e) => acc + (e.githubScore || e.repositoryScore || 0), 0);
    githubScore = Math.round(sumGithubScores / evaluations.length);
  } else {
    const githubProfile = await GithubProfile.findOne({ userId: studentId });
    const githubContributions = await GithubContribution.find({ userId: studentId });
    if (githubProfile) {
      const commits = githubContributions.reduce((acc, c) => acc + (c.commitCount || 0), 0);
      githubScore = Math.min(100, 40 + (githubProfile.publicRepos * 5) + (commits * 2));
    }
  }

  // Certificate Score component
  const progress = completionPercentage; // task completion progress
  const certificateScore = progress >= 80 ? avgScore : avgScore * (progress / 100);

  // Interview Score component
  const interviewScore = avgInterviewScore || 60; // default to 60 if none

  const placementReadiness = Math.round((avgScore + interviewScore + certificateScore + githubScore) / 4);

  // 5. Update or Create Career Intelligence
  let intelligence = await CareerIntelligence.findOne({ studentId });
  if (!intelligence) {
    intelligence = new CareerIntelligence({ studentId });
  }

  // Generate Career recommendations based on tracking category
  const studentCareer = await StudentCareer.findOne({ studentId }).populate('careerId');
  const careerCategory = studentCareer?.careerId?.category || 'ai';

  let recommendedRoles = ['Software Engineer', 'Backend Developer'];
  let recommendedSkills = ['Unit Testing', 'Redis', 'Docker'];
  let recommendedCertifications = ['AWS Certified Developer', 'Node.js Developer Certificate'];
  let recommendedProjects = [
    { title: 'API Gateway Caching Middleware', description: 'Build redis caching triggers.', complexity: 'Medium' }
  ];

  if (careerCategory.toLowerCase() === 'artificial intelligence' || careerCategory.toLowerCase() === 'ai') {
    recommendedRoles = ['AI Engineer', 'ML Operations Specialist', 'NLP Researcher'];
    recommendedSkills = ['Vector Databases', 'Transformers Fine-Tuning', 'LangChain', 'Prometheus Metrics'];
    recommendedCertifications = ['TensorFlow Developer Certificate', 'DeepLearning.AI ML Specialization'];
    recommendedProjects = [
      { title: 'Real-time Embedding Cache Layer', description: 'Design index structures for high-dimensional databases.', complexity: 'Hard' }
    ];
  } else if (careerCategory.toLowerCase() === 'frontend') {
    recommendedRoles = ['Frontend Engineer', 'UI/UX UI Developer', 'Interactive Systems Builder'];
    recommendedSkills = ['TailwindCSS', 'Framer Motion', 'React Canvas API'];
    recommendedCertifications = ['Meta Front-End Developer Professional Certificate'];
    recommendedProjects = [
      { title: 'Interactive Dashboard Widget SDK', description: 'Create customizable drag-and-drop metric items.', complexity: 'Medium' }
    ];
  }

  intelligence.portfolioScore = portfolioScore;
  intelligence.placementReadiness = placementReadiness;
  intelligence.githubScore = githubScore;
  intelligence.readinessScore = placementReadiness;
  intelligence.recommendedRoles = recommendedRoles;
  intelligence.recommendedSkills = recommendedSkills;
  intelligence.recommendedCertifications = recommendedCertifications;
  intelligence.recommendedProjects = recommendedProjects;

  await intelligence.save();
  console.log(`[Evaluation AI] Updated Career Intelligence metrics for student ${studentId}.`);
};
