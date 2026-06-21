import mongoose from 'mongoose';

const feedbackReportSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    recommendations: {
      type: [String],
      default: [],
    },
    managerFeedback: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'feedback_reports',
  }
);

const FeedbackReport = mongoose.model('FeedbackReport', feedbackReportSchema);
export default FeedbackReport;
