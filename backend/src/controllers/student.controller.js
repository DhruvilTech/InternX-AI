import Offer from '../models/Offer.js';
import Notification from '../models/Notification.js';
import Placement from '../models/Placement.js';
import CollegeNotification from '../models/CollegeNotification.js';
import { refreshAnalytics } from '../modules/college/services/college.service.js';
import { sendResponse } from '../utils/sendResponse.js';
import Student from '../models/Student.js';
import College from '../models/College.js';

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
    await Notification.create({
      recipientId: offer.recruiterId,
      senderId: req.user._id,
      title: 'Offer Response Received',
      message: `${req.user.fullName || 'Student'} has ${status} your internship offer for ${offer.companyName}.`,
      type: 'offer_response',
      isRead: false,
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

      // Create College Notification
      await CollegeNotification.create({
        collegeId,
        senderId: req.user._id,
        title: status === 'accepted' ? 'New Placement Accepted' : 'Placement Status Updates',
        message: `${req.user.fullName || 'Student'} has ${status} the internship offer from ${offer.companyName} as ${offer.jobRole || 'Software Engineer Intern'} at ${offer.package || 6} LPA.`,
        type: status === 'accepted' ? 'placement_accepted' : 'placement_updated',
        isRead: false,
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

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user._id })
      .sort({ createdAt: -1 });
    return sendResponse(res, 200, true, 'Notifications retrieved successfully', notifications);
  } catch (error) {
    next(error);
  }
};

export const readNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return sendResponse(res, 404, false, 'Notification not found');
    }

    if (notification.recipientId.toString() !== req.user._id.toString()) {
      return sendResponse(res, 403, false, 'Unauthorized to access this notification');
    }

    notification.isRead = true;
    await notification.save();

    return sendResponse(res, 200, true, 'Notification marked as read successfully', notification);
  } catch (error) {
    next(error);
  }
};
