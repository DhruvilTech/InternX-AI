import * as recruiterService from '../services/recruiter.service.js';
import { sendResponse } from '../../../utils/sendResponse.js';

export const getProfile = async (req, res, next) => {
  try {
    const profile = await recruiterService.getProfileData(req.user._id);
    return sendResponse(res, 200, true, 'Recruiter profile retrieved successfully', profile);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const updated = await recruiterService.updateProfileData(req.user._id, req.body);
    return sendResponse(res, 200, true, 'Recruiter profile updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

export const getDashboard = async (req, res, next) => {
  try {
    const data = await recruiterService.getDashboardData(req.user._id);
    return sendResponse(res, 200, true, 'Dashboard KPIs retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

export const getStudents = async (req, res, next) => {
  try {
    const data = await recruiterService.queryStudents(req.user._id, req.query);
    return sendResponse(res, 200, true, 'Candidate pool retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

export const getStudentDetails = async (req, res, next) => {
  try {
    const data = await recruiterService.getStudentDetails(req.user._id, req.params.id);
    return sendResponse(res, 200, true, 'Candidate audit logs retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

export const getShortlisted = async (req, res, next) => {
  try {
    const data = await recruiterService.getShortlisted(req.user._id);
    return sendResponse(res, 200, true, 'Shortlisted candidates retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

export const toggleShortlist = async (req, res, next) => {
  try {
    const result = await recruiterService.toggleShortlist(req.user._id, req.params.studentId);
    const message = result.status === 'added' ? 'Candidate added to shortlist' : 'Candidate removed from shortlist';
    return sendResponse(res, 200, true, message, result);
  } catch (error) {
    next(error);
  }
};

export const getPipeline = async (req, res, next) => {
  try {
    const data = await recruiterService.getPipeline(req.user._id);
    return sendResponse(res, 200, true, 'Hiring pipeline candidates retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

export const updatePipelineStage = async (req, res, next) => {
  try {
    const { stage, notes } = req.body;
    const data = await recruiterService.updatePipelineStage(req.user._id, req.params.studentId, stage, notes);
    return sendResponse(res, 200, true, 'Pipeline stage updated successfully', data);
  } catch (error) {
    next(error);
  }
};

export const deleteFromPipeline = async (req, res, next) => {
  try {
    const result = await recruiterService.deleteFromPipeline(req.user._id, req.params.studentId);
    return sendResponse(res, 200, true, 'Candidate removed from pipeline successfully', result);
  } catch (error) {
    next(error);
  }
};

export const getContactRequests = async (req, res, next) => {
  try {
    const data = await recruiterService.getContactRequests(req.user._id);
    return sendResponse(res, 200, true, 'Contact requests history retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

export const createContactRequest = async (req, res, next) => {
  try {
    const { studentId, subject, message } = req.body;
    const data = await recruiterService.createContactRequest(req.user._id, studentId, subject, message);
    return sendResponse(res, 201, true, 'Contact outreach request sent successfully', data);
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (req, res, next) => {
  try {
    const data = await recruiterService.getAnalytics(req.user._id);
    return sendResponse(res, 200, true, 'Recruiter analytics aggregates compiled successfully', data);
  } catch (error) {
    next(error);
  }
};

export const createOffer = async (req, res, next) => {
  try {
    const { studentId, companyName, message } = req.body;
    if (!studentId || !companyName || !message) {
      return sendResponse(res, 400, false, 'Missing required offer parameters');
    }
    const offer = await recruiterService.createOffer(req.user._id, studentId, companyName, message);
    return sendResponse(res, 201, true, 'Internship offer sent successfully', offer);
  } catch (error) {
    next(error);
  }
};

export const getSentOffers = async (req, res, next) => {
  try {
    const offers = await recruiterService.getSentOffers(req.user._id);
    return sendResponse(res, 200, true, 'Sent internship offers retrieved successfully', offers);
  } catch (error) {
    next(error);
  }
};
