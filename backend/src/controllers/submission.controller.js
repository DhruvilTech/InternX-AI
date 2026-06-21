import Submission from '../models/Submission.js';
import Evaluation from '../models/Evaluation.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import GithubProfile from '../models/GithubProfile.js';
import SkillAnalysis from '../models/SkillAnalysis.js';
import { decrypt } from '../utils/encryption.js';
import { runEvaluationEngine } from '../services/evaluation.service.js';
import { sendResponse } from '../utils/sendResponse.js';

/**
 * Student transmits their deliverable for code audit and grading.
 * POST /api/submissions/create
 */
export const createSubmission = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const { taskId, submissionType, githubUrl, githubBranch, githubCommitHash, driveLink, fileData, fileName } = req.body;

    if (!taskId) {
      return sendResponse(res, 400, false, 'Task ID is required');
    }

    // Verify task exists and belongs to this student
    const task = await Task.findOne({ _id: taskId, studentId });
    if (!task) {
      return sendResponse(res, 404, false, 'Assigned task not found or access denied');
    }

    if (task.status === 'completed') {
      return sendResponse(res, 400, false, 'This task has already been successfully evaluated and completed. Multiple submissions are not allowed.');
    }

    // Determine type
    let type = submissionType;
    if (!type) {
      if (githubUrl) type = 'github';
      else if (fileData) type = 'zip';
    }

    // Verify option A (GitHub URL) or option B (ZIP upload) is provided
    const hasGithub = !!githubUrl;
    const hasZip = !!(fileData && (fileName?.endsWith('.zip') || type === 'zip'));

    if (!hasGithub && !hasZip) {
      return sendResponse(res, 400, false, 'Please upload a ZIP file or provide a GitHub repository URL.');
    }

    // Filter disallowed URLs
    if (githubUrl) {
      const lowerUrl = githubUrl.toLowerCase();
      const blockedKeywords = ['youtube.com', 'youtu.be', 'drive.google.com', 'linkedin.com', 'portfolio'];
      const isBlocked = blockedKeywords.some(keyword => lowerUrl.includes(keyword)) || !lowerUrl.includes('github.com');
      if (isBlocked) {
        return sendResponse(res, 400, false, 'Invalid GitHub URL. YouTube, Google Drive, Portfolio, and other random URLs are not allowed.');
      }
    }

    // Create Submission record in database
    const submissionPayload = {
      taskId,
      studentId,
      internshipId: task.internshipId,
      submissionType: type,
      githubUrl: type === 'github' ? githubUrl : '',
      githubBranch: type === 'github' ? (githubBranch || 'main') : '',
      githubCommitHash: type === 'github' ? (githubCommitHash || '') : '',
      zipFile: type === 'zip' ? (fileName || 'deliverable.zip') : '',
      status: 'Submitted',
      progress: 10
    };

    const submission = new Submission(submissionPayload);
    await submission.save();

    // Retrieve token if github
    let decryptedToken = null;
    if (type === 'github') {
      const profile = await GithubProfile.findOne({ userId: studentId });
      if (profile && profile.accessToken) {
        decryptedToken = decrypt(profile.accessToken);
      }
    }

    // Trigger AI evaluation in background (asynchronously)
    console.log(`[Submission Controller] Launching async evaluation pipeline for submission ${submission._id}`);
    runEvaluationEngine(submission._id, type, githubUrl, fileData, decryptedToken).catch(err => {
      console.error(`[Background Evaluation error] Submission ID ${submission._id}:`, err);
    });

    return sendResponse(res, 201, true, 'Deliverable submitted and audit initialized', {
      submission
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve current status of the submission.
 * GET /api/submissions/:id/status
 */
export const getSubmissionStatus = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return sendResponse(res, 404, false, 'Submission not found');
    }
    return sendResponse(res, 200, true, 'Submission status retrieved', {
      status: submission.status
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve current progress of the submission.
 * GET /api/submissions/:id/progress
 */
export const getSubmissionProgress = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return sendResponse(res, 404, false, 'Submission not found');
    }
    return sendResponse(res, 200, true, 'Submission progress retrieved', {
      status: submission.status,
      progress: submission.progress
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Trigger evaluation/audit process directly.
 * POST /api/submissions/evaluate
 */
export const evaluateSubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.body;
    if (!submissionId) {
      return sendResponse(res, 400, false, 'Submission ID is required');
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return sendResponse(res, 404, false, 'Submission not found');
    }

    let decryptedToken = null;
    if (submission.submissionType === 'github') {
      const profile = await GithubProfile.findOne({ userId: submission.studentId });
      if (profile && profile.accessToken) {
        decryptedToken = decrypt(profile.accessToken);
      }
    }

    const evaluation = await runEvaluationEngine(submission._id, submission.submissionType, submission.githubUrl, null, decryptedToken);
    return sendResponse(res, 200, true, 'Evaluation run successfully', { evaluation });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve specific evaluation report. Handles security check.
 * GET /api/submissions/:id/report
 */
export const getEvaluationBySubmissionId = async (req, res, next) => {
  try {
    const submissionId = req.params.id;
    const submission = await Submission.findById(submissionId);
    
    if (!submission) {
      return sendResponse(res, 404, false, 'Submission record not found');
    }

    // Security check: Only owner, admin, or recruiter can access
    const isOwner = submission.studentId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isRecruiter = req.user.role === 'recruiter';
    const isCollegeRep = req.user.role === 'college_representative';

    if (!isOwner && !isAdmin && !isRecruiter && !isCollegeRep) {
      return sendResponse(res, 403, false, 'Access denied. You do not have permissions to view this audit.');
    }

    const evaluation = await Evaluation.findOne({ submissionId });
    if (!evaluation) {
      return sendResponse(res, 404, false, 'Evaluation report not yet compiled for this submission');
    }

    return sendResponse(res, 200, true, 'Evaluation report retrieved successfully', {
      submission,
      evaluation
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get student's updated skills analysis related to this submission.
 * GET /api/submissions/:id/skills
 */
export const getSkillsBySubmissionId = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return sendResponse(res, 404, false, 'Submission not found');
    }

    const skillAnalysis = await SkillAnalysis.findOne({ studentId: submission.studentId });
    let skillsArray = [];
    if (skillAnalysis) {
      if (skillAnalysis.currentSkills instanceof Map) {
        skillAnalysis.currentSkills.forEach((level, name) => {
          skillsArray.push({ name, level });
        });
      } else if (skillAnalysis.currentSkills) {
        Object.entries(skillAnalysis.currentSkills).forEach(([name, level]) => {
          skillsArray.push({ name, level });
        });
      }
    }
    return sendResponse(res, 200, true, 'Skills retrieved successfully', {
      skills: skillsArray
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve submissions belonging to the logged-in student.
 * GET /api/submissions/my-submissions
 */
export const getMySubmissions = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const { taskId } = req.query;

    const query = { studentId };
    if (taskId) {
      query.taskId = taskId;
    }

    const submissions = await Submission.find(query)
      .populate('taskId', 'title status score')
      .sort({ createdAt: -1 });

    return sendResponse(res, 200, true, 'Submissions history retrieved successfully', { submissions });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve student submissions for admin and recruiter dashboards.
 * GET /api/submissions/student/:studentId
 */
export const getStudentSubmissions = async (req, res, next) => {
  try {
    const studentId = req.params.studentId;

    // Verify requesting user is admin/recruiter/college representative
    if (!['admin', 'recruiter', 'college_representative'].includes(req.user.role)) {
      return sendResponse(res, 403, false, 'Access denied. Privileged users only.');
    }

    const submissions = await Submission.find({ studentId })
      .populate('taskId', 'title expectedOutput status score')
      .sort({ createdAt: -1 });

    return sendResponse(res, 200, true, 'Student submissions fetched successfully', { submissions });
  } catch (error) {
    next(error);
  }
};
