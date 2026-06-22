import * as collegeService from '../services/college.service.js';
import College from '../models/College.js';
import Department from '../models/Department.js';
import Certificate from '../models/Certificate.js';
import GithubProfile from '../../../models/GithubProfile.js';
import GithubContribution from '../../../models/GithubContribution.js';
import Student from '../../../models/Student.js';
import StudentCareer from '../../../models/StudentCareer.js';
import { sendResponse } from '../../../utils/sendResponse.js';

/**
 * Retrieves the logged-in college profile.
 */
export const getProfile = async (req, res, next) => {
  try {
    const profile = await College.findById(req.college._id).populate('departments');
    return sendResponse(res, 200, true, 'College profile retrieved successfully', profile);
  } catch (error) {
    next(error);
  }
};

/**
 * Updates the college profile details.
 */
export const patchProfile = async (req, res, next) => {
  try {
    const updated = await College.findByIdAndUpdate(
      req.college._id,
      { $set: req.body },
      { returnDocument: 'after' }
    ).populate('departments');

    return sendResponse(res, 200, true, 'College profile updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Returns dashboard aggregates.
 */
export const getDashboard = async (req, res, next) => {
  try {
    const analytics = await collegeService.getDashboardData(req.college);
    return sendResponse(res, 200, true, 'Dashboard analytics retrieved successfully', analytics);
  } catch (error) {
    next(error);
  }
};

/**
 * Lists students associated with the college.
 */
export const getStudents = async (req, res, next) => {
  try {
    const results = await collegeService.queryStudents(req.college, req.query);
    return sendResponse(res, 200, true, 'Students retrieved successfully', results);
  } catch (error) {
    next(error);
  }
};

/**
 * Returns detailed student profile, github progress, and certificates.
 */
export const getStudentDetails = async (req, res, next) => {
  try {
    const details = await collegeService.getStudentDetails(req.college, req.params.id);
    return sendResponse(res, 200, true, 'Student details retrieved successfully', details);
  } catch (error) {
    next(error);
  }
};

/**
 * Returns internship metrics.
 */
export const getInternships = async (req, res, next) => {
  try {
    const stats = await collegeService.getInternshipAnalytics(req.college);
    return sendResponse(res, 200, true, 'Internship analytics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

/**
 * Returns skill aggregates.
 */
export const getSkills = async (req, res, next) => {
  try {
    const stats = await collegeService.getSkillAnalytics(req.college);
    return sendResponse(res, 200, true, 'Skill analytics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

/**
 * Returns placement readiness lists.
 */
export const getPlacementReadiness = async (req, res, next) => {
  try {
    const stats = await collegeService.getPlacementReadiness(req.college);
    return sendResponse(res, 200, true, 'Placement readiness diagnostics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

/**
 * Returns certificates issued list.
 */
export const getCertificates = async (req, res, next) => {
  try {
    const stats = await collegeService.getCertificateStatistics(req.college);
    return sendResponse(res, 200, true, 'Certificates list retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

/**
 * Returns details of a specific certificate.
 */
export const getCertificateDetails = async (req, res, next) => {
  try {
    const certificate = await Certificate.findOne({ _id: req.params.id, collegeId: req.college._id });
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found.' });
    }
    return sendResponse(res, 200, true, 'Certificate details retrieved successfully', certificate);
  } catch (error) {
    next(error);
  }
};

/**
 * Verifies certificate code authenticity.
 */
export const verifyCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.id });
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Invalid certificate credential ID. Verify seal is unauthentic.',
      });
    }

    return sendResponse(res, 200, true, 'Certificate authenticity verified successfully', {
      recipient: certificate.recipientName,
      track: certificate.roleTitle,
      grade: `${certificate.grade}/100`,
      date: new Date(certificate.issueDate).toLocaleDateString(),
      status: certificate.status
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resolves specific student GitHub statistics.
 */
export const getStudentGithub = async (req, res, next) => {
  try {
    const student = await Student.findOne({ _id: req.params.id, collegeName: req.college.name });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found in college.' });
    }

    const githubProfile = await GithubProfile.findOne({ userId: student.userId });
    if (!githubProfile) {
      return res.status(404).json({ success: false, message: 'Student has not linked GitHub account.' });
    }

    const githubContributions = await GithubContribution.find({ userId: student.userId });

    return sendResponse(res, 200, true, 'Student GitHub statistics retrieved successfully', {
      profile: githubProfile,
      contributions: githubContributions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Compiles and returns institutional reports.
 */
export const getReports = async (req, res, next) => {
  try {
    const { type } = req.query; // placement, internships, skills, certificates
    if (!type) {
      return res.status(400).json({ success: false, message: 'Report type parameter is required.' });
    }

    const data = await collegeService.compileReportData(req.college, type);
    return sendResponse(res, 200, true, 'Report dataset compiled successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * Creates a new department.
 */
export const createDepartment = async (req, res, next) => {
  try {
    const { departmentName, departmentCode, headOfDepartment } = req.body;

    let dept = await Department.findOne({ collegeId: req.college._id, departmentCode });
    if (dept) {
      return res.status(400).json({ success: false, message: 'Department code already registered.' });
    }

    dept = await Department.create({
      collegeId: req.college._id,
      departmentName,
      departmentCode,
      headOfDepartment
    });

    // Update College reference
    await College.findByIdAndUpdate(req.college._id, {
      $push: { departments: dept._id }
    });

    return sendResponse(res, 201, true, 'Department created successfully', dept);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves the placement records associated with the college.
 */
export const getPlacements = async (req, res, next) => {
  try {
    const results = await collegeService.queryPlacements(req.college, req.query);
    return sendResponse(res, 200, true, 'Placements retrieved successfully', results);
  } catch (error) {
    next(error);
  }
};

