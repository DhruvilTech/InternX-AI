import mongoose from 'mongoose';

const collegeAnalyticsSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
      unique: true,
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
    activeInternships: {
      type: Number,
      default: 0,
    },
    completedInternships: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    placementReadiness: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    certificatesIssued: {
      type: Number,
      default: 0,
    },
    githubConnectedStudents: {
      type: Number,
      default: 0,
    },
    interviewReadyStudents: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const CollegeAnalytics = mongoose.models.CollegeAnalytics || mongoose.model('CollegeAnalytics', collegeAnalyticsSchema);
export default CollegeAnalytics;
