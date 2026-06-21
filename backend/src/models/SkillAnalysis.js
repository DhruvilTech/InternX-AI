import mongoose from 'mongoose';

const skillAnalysisSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    careerPath: {
      type: String,
      default: 'Backend Developer',
    },
    currentSkills: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    benchmarkSkills: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    skillGaps: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    learningRecommendations: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const SkillAnalysis = mongoose.model('SkillAnalysis', skillAnalysisSchema);
export default SkillAnalysis;
