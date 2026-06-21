import mongoose from 'mongoose';

const skillGapReportSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    missingSkills: {
      type: [String],
      default: [],
    },
    detectedSkills: {
      type: [String],
      default: [],
    },
    gapPercentage: {
      type: Number,
      required: true,
      default: 0,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'skill_gap_reports',
  }
);

const SkillGapReport = mongoose.model('SkillGapReport', skillGapReportSchema);
export default SkillGapReport;
