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
      type: Map,
      of: Number,
      default: {},
    },
    benchmarkSkills: {
      type: Map,
      of: Number,
      default: {},
    },
    skillGaps: {
      type: Map,
      of: Number,
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
