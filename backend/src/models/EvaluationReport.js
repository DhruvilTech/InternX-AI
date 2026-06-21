import mongoose from 'mongoose';

const evaluationReportSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    internshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship',
    },
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
    },
    overallScore: {
      type: Number,
      default: 0,
    },
    technicalScore: {
      type: Number,
      default: 0,
    },
    codeQuality: {
      type: Number,
      default: 0,
    },
    projectStructure: {
      type: Number,
      default: 0,
    },
    documentationScore: {
      type: Number,
      default: 0,
    },
    githubScore: {
      type: Number,
      default: 0,
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    identifiedSkills: {
      type: [String],
      default: [],
    },
    identifiedSkillGaps: {
      type: [String],
      default: [],
    },
    recommendations: {
      type: [String],
      default: [],
    },
    careerRecommendations: {
      type: [String],
      default: [],
    },
    readinessLevel: {
      type: String,
      default: 'Beginner',
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'evaluation_reports',
  }
);

// Prevent mongoose duplicate compilation error
const EvaluationReport = mongoose.models.EvaluationReport || mongoose.model('EvaluationReport', evaluationReportSchema);
export default EvaluationReport;
