import Offer from '../models/Offer.js';
import Notification from '../models/Notification.js';
import Placement from '../models/Placement.js';
import { refreshAnalytics } from '../modules/college/services/college.service.js';
import { sendResponse } from '../utils/sendResponse.js';
import Student from '../models/Student.js';
import College from '../models/College.js';
import StudentCareer from '../models/StudentCareer.js';
import Task from '../models/Task.js';
import SubmissionRepository from '../models/SubmissionRepository.js';
import EvaluationReport from '../models/EvaluationReport.js';
import Internship from '../models/Internship.js';

export const getReceivedOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find({ studentId: req.user._id })
      .populate('recruiterId', 'fullName email avatar')
      .sort({ createdAt: -1 });
    return sendResponse(res, 200, true, 'Received internship offers retrieved successfully', offers);
  } catch (error) {
    next(error);
  }
};

export const respondToOffer = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return sendResponse(res, 400, false, 'Invalid response status. Must be accepted or rejected');
    }

    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return sendResponse(res, 404, false, 'Offer not found');
    }

    if (offer.studentId.toString() !== req.user._id.toString()) {
      return sendResponse(res, 403, false, 'Unauthorized to respond to this offer');
    }

    offer.status = status;
    await offer.save();

    // Create notification for recruiter
    await Notification.createUnique({
      recipientId: offer.recruiterId,
      senderId: req.user._id,
      title: 'Offer Response Received',
      message: `${req.user.fullName || 'Student'} has ${status} your internship offer for ${offer.companyName}.`,
      type: 'offer_response',
      entityId: offer._id,
    });

    // Centralized Placement Tracking & College Analytics Automation
    let collegeId = req.user.collegeId;
    if (!collegeId) {
      const studentProfile = await Student.findOne({ userId: req.user._id });
      if (studentProfile) {
        const col = await College.findOne({
          $or: [
            { name: studentProfile.collegeName },
            { collegeName: studentProfile.collegeName }
          ]
        });
        if (col) {
          collegeId = col._id;
        }
      }
    }

    if (collegeId) {
      // Find existing pending placement or create a new one
      let placement = await Placement.findOne({
        studentId: req.user._id,
        recruiterId: offer.recruiterId,
        offerStatus: 'pending'
      });

      if (placement) {
        placement.offerStatus = status;
        if (status === 'accepted') {
          placement.acceptedAt = new Date();
        }
        await placement.save();
      } else {
        placement = await Placement.create({
          studentId: req.user._id,
          collegeId,
          recruiterId: offer.recruiterId,
          companyName: offer.companyName,
          jobRole: offer.jobRole || 'Software Engineer Intern',
          offerStatus: status,
          package: offer.package || 6,
          acceptedAt: status === 'accepted' ? new Date() : null
        });
      }

      // Create College Notification using the unified Notification model
      await Notification.createUnique({
        recipientId: collegeId,
        senderId: req.user._id,
        title: status === 'accepted' ? 'New Placement Accepted' : 'Placement Status Updates',
        message: `${req.user.fullName || 'Student'} has ${status} the internship offer from ${offer.companyName} as ${offer.jobRole || 'Software Engineer Intern'} at ${offer.package || 6} LPA.`,
        type: status === 'accepted' ? 'placement_accepted' : 'placement_updated',
        entityId: placement._id,
      });

      // Update College Analytics
      try {
        await refreshAnalytics(collegeId);
      } catch (analyticsError) {
        console.error('Failed to auto-update college analytics:', analyticsError);
      }
    }

    return sendResponse(res, 200, true, `Offer successfully ${status}`, offer);
  } catch (error) {
    next(error);
  }
};

export const getStudentDashboard = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    const [studentCareer, internship, tasks, connectedRepo, evaluationReport] = await Promise.all([
      StudentCareer.findOne({ studentId }).populate('careerId').lean(),
      Internship.findOne({ studentId }).lean(),
      Task.find({ studentId }).lean(),
      SubmissionRepository.findOne({ userId: studentId }).lean(),
      (async () => {
        let rep = await EvaluationReport.findOne({ studentId }).lean();
        if (!rep) {
          const student = await Student.findOne({ userId: studentId }).lean();
          if (student) {
            rep = await EvaluationReport.findOne({ studentId: student.userId }).lean();
          }
        }
        return rep;
      })()
    ]);

    return sendResponse(res, 200, true, 'Student dashboard summary retrieved successfully', {
      studentCareer,
      internship,
      tasks,
      connectedRepo,
      evaluationReport
    });
  } catch (error) {
    next(error);
  }
};

