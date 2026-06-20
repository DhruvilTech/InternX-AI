import mongoose from 'mongoose';

const placementReportSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
    readyStudents: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    certificateCount: {
      type: Number,
      default: 0,
    },
    internshipCompletionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    topSkills: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const PlacementReport = mongoose.models.PlacementReport || mongoose.model('PlacementReport', placementReportSchema);
export default PlacementReport;
