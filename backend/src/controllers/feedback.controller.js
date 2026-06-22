import Feedback from '../models/Feedback.js';
import SkillAnalysis from '../models/SkillAnalysis.js';
import CareerIntelligence from '../models/CareerIntelligence.js';
import EvaluationReport from '../models/EvaluationReport.js';
import Internship from '../models/Internship.js';
import User from '../models/User.js';
import Submission from '../models/Submission.js';
import Task from '../models/Task.js';
import FeedbackReport from '../models/FeedbackReport.js';
import { generateFeedbackRecord, analyzeStudentSkills, generateCareerIntelligence } from '../services/feedback.service.js';
import { checkReportCache, generateCareerReports } from '../services/careerReport.service.js';
import { callGroq } from '../services/groq.service.js';
import { sendResponse } from '../utils/sendResponse.js';

/**
 * Trigger feedback generation for a specific task submission.
 * POST /api/feedback/generate
 */
export const generateFeedback = async (req, res, next) => {
  try {
    const { submissionId } = req.body;
    if (!submissionId) {
      return sendResponse(res, 400, false, 'Submission ID is required');
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return sendResponse(res, 404, false, 'Submission not found');
    }

    // Verify ownership or privileged access
    const isOwner = submission.studentId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return sendResponse(res, 403, false, 'Access denied. Privileged or owner only.');
    }

    const task = await Task.findById(submission.taskId);
    
    // Simulate/mock or fetch evaluationData
    const evaluationData = {
      strengths: ['Clean code design', 'REST conformity', 'Correct MVC structure'],
      weaknesses: ['Lack of unit test files', 'Centralized error handling could be improved'],
      recommendations: ['Integrate unit testing configurations', 'Expose error handling wrapper middlewares']
    };

    const feedback = await generateFeedbackRecord(
      submission._id, 
      submission.taskId, 
      submission.studentId, 
      submission.internshipId || task?.internshipId, 
      evaluationData
    );

    return sendResponse(res, 200, true, 'Feedback report generated successfully', { feedback });
  } catch (error) {
    next(error);
  }
};

/**
 * Trigger skills gap analysis calculation for a student.
 * POST /api/skills/analyze
 */
export const analyzeSkills = async (req, res, next) => {
  try {
    const { studentId, careerPath } = req.body;
    const targetId = studentId || req.user._id;

    // Verify student ownership or admin status
    const isOwner = targetId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return sendResponse(res, 403, false, 'Access denied. Privileged or owner only.');
    }

    const analysis = await analyzeStudentSkills(targetId, careerPath);
    return sendResponse(res, 200, true, 'Skills gap analysis executed successfully', { analysis });
  } catch (error) {
    next(error);
  }
};

/**
 * Trigger career readiness intelligence compilation.
 * POST /api/career/generate
 */
export const generateCareerIntel = async (req, res, next) => {
  try {
    const { studentId, internshipId } = req.body;
    const targetId = studentId || req.user._id;

    // Verify ownership or admin status
    const isOwner = targetId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return sendResponse(res, 403, false, 'Access denied. Privileged or owner only.');
    }

    const intel = await generateCareerIntelligence(targetId, internshipId);
    return sendResponse(res, 200, true, 'Career intelligence scorecard compiled successfully', { intel });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve feedback reports compiled for a specific student.
 * GET /api/feedback/student/:id
 */
export const getFeedbackByStudent = async (req, res, next) => {
  try {
    const studentId = req.params.id;

    // Security check: Only owner, recruiter, or admin
    const isOwner = studentId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isRecruiter = req.user.role === 'recruiter';
    if (!isOwner && !isAdmin && !isRecruiter) {
      return sendResponse(res, 403, false, 'Access denied. Privileged users or owner only.');
    }

    const feedbacks = await Feedback.find({ studentId }).populate('taskId', 'title status score').sort({ createdAt: -1 });
    
    // Check if overall report exists in cache, otherwise generate it
    let reports = await checkReportCache(studentId);
    if (!reports) {
      reports = await generateCareerReports(studentId);
    }
    const feedbackReport = reports.feedback;

    return sendResponse(res, 200, true, 'Student feedback reports fetched successfully', { 
      feedbacks,
      feedbackReport
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve skills analysis metrics and gaps diagnostics for a student.
 * GET /api/skills/student/:id
 */
export const getSkillsByStudent = async (req, res, next) => {
  try {
    const studentId = req.params.id;

    // Security check: Only owner, recruiter, or admin
    const isOwner = studentId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isRecruiter = req.user.role === 'recruiter';
    if (!isOwner && !isAdmin && !isRecruiter) {
      return sendResponse(res, 403, false, 'Access denied. Privileged users or owner only.');
    }

    let analysis = await SkillAnalysis.findOne({ studentId });
    if (!analysis) {
      // Create a default initial calculation so it never returns empty
      analysis = await analyzeStudentSkills(studentId);
    }

    return sendResponse(res, 200, true, 'Student skills analysis retrieved successfully', { analysis });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve placement readiness diagnostics and career advice for a student.
 * GET /api/career/student/:id
 */
export const getCareerByStudent = async (req, res, next) => {
  try {
    const studentId = req.params.id;

    // Security check: Only owner, recruiter, or admin
    const isOwner = studentId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isRecruiter = req.user.role === 'recruiter';
    if (!isOwner && !isAdmin && !isRecruiter) {
      return sendResponse(res, 403, false, 'Access denied. Privileged users or owner only.');
    }

    let intel = await CareerIntelligence.findOne({ studentId });
    if (!intel) {
      // Create initial metrics on-the-fly
      intel = await generateCareerIntelligence(studentId);
    }

    return sendResponse(res, 200, true, 'Student career intelligence diagnostics fetched successfully', { intel });
  } catch (error) {
    next(error);
  }
};

/**
 * AI-powered chat with manager agent, grounded in real student data.
 * POST /api/feedback/chat
 * Body: { channel: 'technical'|'manager'|'career', history: [{role, content}], message: string }
 */
export const chatWithAIManager = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const { channel = 'technical', history = [], message } = req.body;

    if (!message || !message.trim()) {
      return sendResponse(res, 400, false, 'Message is required');
    }

    // --- Gather real student context from the database ---
    const [user, evalReport, skillAnalysis, careerIntel, internship, recentTasks] = await Promise.allSettled([
      User.findById(studentId).select('fullName email track').lean(),
      EvaluationReport.findOne({ studentId }).lean(),
      SkillAnalysis.findOne({ studentId }).lean(),
      CareerIntelligence.findOne({ studentId }).lean(),
      Internship.findOne({ studentId }).sort({ createdAt: -1 }).lean(),
      Task.find({ studentId }).sort({ updatedAt: -1 }).limit(5).lean(),
    ]);

    const userData    = user.status === 'fulfilled'          ? user.value          : null;
    const evalData    = evalReport.status === 'fulfilled'    ? evalReport.value    : null;
    const skillData   = skillAnalysis.status === 'fulfilled' ? skillAnalysis.value : null;
    const careerData  = careerIntel.status === 'fulfilled'   ? careerIntel.value   : null;
    const internData  = internship.status === 'fulfilled'    ? internship.value    : null;
    const tasks       = recentTasks.status === 'fulfilled'   ? recentTasks.value   : [];

    // --- Build student context summary string ---
    const studentName  = userData?.fullName  || 'Student';
    const track        = userData?.track     || 'software';
    const companyName  = internData?.companyName      || 'InternX AI';
    const managerName  = internData?.managerName      || 'Lead Manager';
    const managerRole  = internData?.managerRole      || 'AI Manager';
    const internRole   = internData?.internshipRole   || 'Intern';
    const projectName  = internData?.projectName      || 'internship project';
    const projectDesc  = internData?.projectDescription || '';

    const overallScore     = evalData?.overallScore       || 0;
    const technicalScore   = evalData?.technicalScore     || 0;
    const codeQuality      = evalData?.codeQuality        || 0;
    const docScore         = evalData?.documentationScore || 0;
    const githubScore      = evalData?.githubScore        || 0;
    const strengths        = (evalData?.strengths         || []).slice(0, 5).join(', ') || 'none recorded';
    const weaknesses       = (evalData?.weaknesses        || []).slice(0, 5).join(', ') || 'none recorded';
    const recommendations  = (evalData?.recommendations  || []).slice(0, 4).join('; ')  || 'none';
    const identifiedSkills = (evalData?.identifiedSkills  || []).slice(0, 6).join(', ') || 'none';
    const skillGaps        = (evalData?.identifiedSkillGaps || []).slice(0, 5).join(', ') || 'none';
    const readinessLevel   = evalData?.readinessLevel   || careerData?.careerReadiness || 'Beginner';

    const portfolioScore      = careerData?.portfolioScore      || 0;
    const placementReadiness  = careerData?.placementReadiness  || 0;
    const recommendedRoles    = (careerData?.recommendedRoles   || []).join(', ') || 'not computed';
    const recommendedSkills   = (careerData?.recommendedSkills  || []).join(', ') || 'not computed';
    const certs               = (careerData?.recommendedCertifications || []).join(', ') || 'none';

    const taskSummary = tasks.length > 0
      ? tasks.map(t => `"${t.title}" (status: ${t.status}, score: ${t.score || 0})`).join('; ')
      : 'no tasks found';

    const skillSummary = skillData?.currentSkills
      ? Object.entries(skillData.currentSkills).slice(0, 6).map(([k, v]) => `${k}: ${v}%`).join(', ')
      : identifiedSkills;

    // --- Build the channel-specific persona ---
    const channelPersonas = {
      technical: `You are ${managerName}, the senior technical lead and AI mentor at ${companyName}. Your role is "${managerRole}". You are talking with ${studentName}, who is working as a "${internRole}" on the project "${projectName}". Be direct, technical, and insightful. Reference their actual evaluation scores, code quality metrics, and strengths/weaknesses when relevant. Give actionable technical advice.`,
      manager: `You are ${managerName}, the internship manager at ${companyName}. Your role is "${managerRole}". You are mentoring ${studentName} who is working on "${projectName}". Focus on project progress, sprint planning, delivery quality, and professional growth. Reference their actual task completion history and evaluation scores when relevant.`,
      career: `You are ${managerName}, the career advisor and placement lead at ${companyName}. You are helping ${studentName} prepare for industry placements. Focus on their portfolio strength, placement readiness, recommended roles, skill gaps, and certification roadmap. Reference their actual career intelligence data.`,
    };

    // --- Build the comprehensive student data context block ---
    const studentContext = `
=== STUDENT PERFORMANCE DATA (live from database) ===
Student: ${studentName} | Track: ${track} | Role: ${internRole}
Company: ${companyName} | Project: ${projectName}
${projectDesc ? `Project Description: ${projectDesc}` : ''}

EVALUATION SCORES:
- Overall Score: ${overallScore}/100
- Technical Score: ${technicalScore}/100
- Code Quality: ${codeQuality}/100
- Documentation: ${docScore}/100
- GitHub Score: ${githubScore}/100
- Readiness Level: ${readinessLevel}

STRENGTHS: ${strengths}
WEAKNESSES: ${weaknesses}
RECOMMENDATIONS: ${recommendations}

SKILLS IDENTIFIED: ${skillSummary}
SKILL GAPS: ${skillGaps}

CAREER INTELLIGENCE:
- Portfolio Score: ${portfolioScore}/100
- Placement Readiness: ${placementReadiness}/100
- Recommended Roles: ${recommendedRoles}
- Skills to Develop: ${recommendedSkills}
- Recommended Certifications: ${certs}

RECENT TASKS: ${taskSummary}
=== END OF STUDENT DATA ===

INSTRUCTIONS:
- You MUST reference the actual data above to personalize your response.
- Do NOT make up scores or data not present above.
- If a score is 0 or data is missing, acknowledge that no evaluation has been completed yet.
- Keep responses professional, concise (3-5 sentences), and encouraging but honest.
- Do NOT use generic placeholder phrases like "run a benchmark on staging" or "check latency curves".
- Speak naturally as the manager persona described above.
- Respond only in plain text (no JSON, no markdown formatting).
`.trim();

    const systemPrompt = `${channelPersonas[channel] || channelPersonas.technical}\n\n${studentContext}`;

    // --- Build messages array from conversation history + new message ---
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-10).map(h => ({  // Keep last 10 turns to avoid token overflow
        role: h.role === 'user' ? 'user' : 'assistant',
        content: h.content
      })),
      { role: 'user', content: message.trim() }
    ];

    // --- Call Groq AI ---
    let aiReply = '';
    try {
      aiReply = await callGroq({
        model: 'llama-3.1-8b-instant',
        messages,
        temperature: 0.5,
        jsonMode: false
      });
    } catch (groqError) {
      console.error('[Feedback Chat] Groq AI call failed:', groqError.message);
      // Provide a graceful fallback based on the student's actual data
      if (overallScore > 0) {
        aiReply = `Thanks for reaching out, ${studentName}. Based on your current evaluation score of ${overallScore}/100, you're making solid progress. Your key areas to focus on are: ${recommendations || 'continuing to improve your code quality and documentation'}.`;
      } else {
        aiReply = `Hi ${studentName}! I don't see any completed evaluations yet. Once you submit a task deliverable, I'll be able to give you personalized feedback based on your actual performance data.`;
      }
    }

    return sendResponse(res, 200, true, 'AI response generated', { reply: aiReply });
  } catch (error) {
    next(error);
  }
};
