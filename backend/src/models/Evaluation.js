import mongoose from 'mongoose';

const evaluationSchema = new mongoose.Schema(
  {
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      required: true,
    },
    technicalScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    repositoryScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    architectureScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    codeQualityScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    documentationScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    problemSolvingScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    githubScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
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
    reasons: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    evaluatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Evaluation = mongoose.model('Evaluation', evaluationSchema);
export default Evaluation;
