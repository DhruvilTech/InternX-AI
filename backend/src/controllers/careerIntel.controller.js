import { generateCareerReports, checkReportCache } from '../services/careerReport.service.js';
import { sendResponse } from '../utils/sendResponse.js';
import User from '../models/User.js';

/**
 * POST /api/career/analyze
 * Forces generation of Career Report, Skill Gap Report, and Feedback Report.
 */
export const analyzeCareer = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    const targetId = studentId || req.user._id;

    // Permissions: owner or admin or recruiter
    const isOwner = targetId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isRecruiter = req.user.role === 'recruiter';
    if (!isOwner && !isAdmin && !isRecruiter) {
      return sendResponse(res, 403, false, 'Access denied. Privileged or owner only.');
    }

    const reports = await generateCareerReports(targetId);
    return sendResponse(res, 200, true, 'Career and skill gap analysis executed successfully', reports);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/career/report/:studentId
 * Returns the latest report, generating it if it doesn't exist or is outdated.
 */
export const getLatestReport = async (req, res, next) => {
  try {
    const studentId = req.params.studentId;

    // Permissions: owner or admin or recruiter
    const isOwner = studentId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isRecruiter = req.user.role === 'recruiter';
    if (!isOwner && !isAdmin && !isRecruiter) {
      return sendResponse(res, 403, false, 'Access denied. Privileged or owner only.');
    }

    // Check cache
    let reports = await checkReportCache(studentId);
    if (!reports) {
      console.log(`[Cache Miss] Regenerating report for student: ${studentId}`);
      reports = await generateCareerReports(studentId);
    } else {
      console.log(`[Cache Hit] Returning cached report for student: ${studentId}`);
    }

    return sendResponse(res, 200, true, 'Latest career report retrieved successfully', reports);
  } catch (error) {
    next(error);
  }
};
