import mongoose from 'mongoose';

const careerReportSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    readinessScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    portfolioScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    githubScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    careerLevel: {
      type: String,
      required: true,
      default: 'Beginner',
    },
    recommendedRoles: {
      type: [String],
      default: [],
    },
    recommendedSkills: {
      type: [String],
      default: [],
    },
    recommendedProjects: {
      type: [String],
      default: [],
    },
    recommendedCertifications: {
      type: [String],
      default: [],
    },
    salaryRange: {
      type: String,
      default: '',
    },
    careerAdvice: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    collection: 'career_reports',
  }
);

const CareerReport = mongoose.model('CareerReport', careerReportSchema);
export default CareerReport;
