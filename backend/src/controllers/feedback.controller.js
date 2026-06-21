import Feedback from '../models/Feedback.js';
import SkillAnalysis from '../models/SkillAnalysis.js';
import CareerIntelligence from '../models/CareerIntelligence.js';
import Submission from '../models/Submission.js';
import Task from '../models/Task.js';
import FeedbackReport from '../models/FeedbackReport.js';
import { generateFeedbackRecord, analyzeStudentSkills, generateCareerIntelligence } from '../services/feedback.service.js';
import { checkReportCache, generateCareerReports } from '../services/careerReport.service.js';
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
