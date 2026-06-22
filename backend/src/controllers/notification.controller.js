import Notification from '../models/Notification.js';
import CollegeRepresentative from '../models/CollegeRepresentative.js';
import College from '../models/College.js';
import User from '../models/User.js';
import { sendResponse } from '../utils/sendResponse.js';

/**
 * GET /api/notifications
 * Retrieve paginated notifications for current user/college, latest first.
 */
export const getNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    let recipientIds = [req.user._id];

    // If the user has a college role, also include their collegeId
    if (req.user.role === 'college_representative') {
      const rep = await CollegeRepresentative.findOne({ userId: req.user._id });
      if (rep) recipientIds.push(rep.collegeId);
    } else if (req.user.role === 'college') {
      const college = await College.findOne({ userId: req.user._id });
      if (college) recipientIds.push(college._id);
    }

    const query = {
      recipientId: { $in: recipientIds },
      isDeleted: false,
    };

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .populate('senderId', 'fullName email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const unreadCount = await Notification.countDocuments({
      recipientId: { $in: recipientIds },
      isRead: false,
      isDeleted: false,
    });

    return sendResponse(res, 200, true, 'Notifications retrieved successfully', {
      notifications,
      unreadCount,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Mark a specific notification as read.
 */
export const readNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return sendResponse(res, 404, false, 'Notification not found');
    }

    let recipientIds = [req.user._id.toString()];
    if (req.user.role === 'college_representative') {
      const rep = await CollegeRepresentative.findOne({ userId: req.user._id });
      if (rep) recipientIds.push(rep.collegeId.toString());
    } else if (req.user.role === 'college') {
      const college = await College.findOne({ userId: req.user._id });
      if (college) recipientIds.push(college._id.toString());
    }

    if (!recipientIds.includes(notification.recipientId.toString())) {
      return sendResponse(res, 403, false, 'Unauthorized to access this notification');
    }

    notification.isRead = true;
    await notification.save();

    return sendResponse(res, 200, true, 'Notification marked as read successfully', notification);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications for current user/college as read.
 */
export const readAllNotifications = async (req, res, next) => {
  try {
    let recipientIds = [req.user._id];
    if (req.user.role === 'college_representative') {
      const rep = await CollegeRepresentative.findOne({ userId: req.user._id });
      if (rep) recipientIds.push(rep.collegeId);
    } else if (req.user.role === 'college') {
      const college = await College.findOne({ userId: req.user._id });
      if (college) recipientIds.push(college._id);
    }

    await Notification.updateMany(
      { recipientId: { $in: recipientIds }, isRead: false, isDeleted: false },
      { $set: { isRead: true } }
    );

    return sendResponse(res, 200, true, 'All notifications marked as read successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/notifications/:id
 * Mark a notification as deleted (soft delete).
 */
export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return sendResponse(res, 404, false, 'Notification not found');
    }

    let recipientIds = [req.user._id.toString()];
    if (req.user.role === 'college_representative') {
      const rep = await CollegeRepresentative.findOne({ userId: req.user._id });
      if (rep) recipientIds.push(rep.collegeId.toString());
    } else if (req.user.role === 'college') {
      const college = await College.findOne({ userId: req.user._id });
      if (college) recipientIds.push(college._id.toString());
    }

    if (!recipientIds.includes(notification.recipientId.toString())) {
      return sendResponse(res, 403, false, 'Unauthorized to delete this notification');
    }

    notification.isDeleted = true;
    await notification.save();

    return sendResponse(res, 200, true, 'Notification deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/notifications/announcement
 * Broadcast an announcement notification from an admin.
 */
export const postAnnouncement = async (req, res, next) => {
  try {
    const { title, message, targetRole } = req.body;
    if (!title || !message) {
      return sendResponse(res, 400, false, 'Title and message are required');
    }

    const query = { isVerified: true };
    if (targetRole && targetRole !== 'all') {
      query.role = targetRole;
    }

    const users = await User.find(query).select('_id');
    
    const promises = users.map((user) =>
      Notification.createUnique({
        recipientId: user._id,
        senderId: req.user._id,
        title,
        message,
        type: 'announcement',
      })
    );
    await Promise.all(promises);

    return sendResponse(res, 201, true, 'Announcement broadcast successfully');
  } catch (error) {
    next(error);
  }
};
