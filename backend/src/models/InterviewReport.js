import mongoose from 'mongoose';

const interviewReportSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
      unique: true,
    },
    technicalScore: {
      type: Number,
      required: true,
    },
    communicationScore: {
      type: Number,
      required: true,
    },
    professionalismScore: {
      type: Number,
      required: true,
    },
    problemSolvingScore: {
      type: Number,
      required: true,
    },
    overallScore: {
      type: Number,
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
    careerAdvice: {
      type: String,
      default: '',
    },
    readinessLevel: {
      type: String,
      default: '', // e.g., Beginner, Intermediate, Job Ready
    },
  },
  {
    timestamps: true,
  }
);

const InterviewReport = mongoose.model('InterviewReport', interviewReportSchema);
export default InterviewReport;
