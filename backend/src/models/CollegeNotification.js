import mongoose from 'mongoose';

const collegeNotificationSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['placement_accepted', 'offer_received', 'placement_updated'],
      default: 'offer_received',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const CollegeNotification = mongoose.models.CollegeNotification || mongoose.model('CollegeNotification', collegeNotificationSchema);
export default CollegeNotification;
