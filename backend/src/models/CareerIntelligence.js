import mongoose from 'mongoose';

const careerIntelligenceSchema = new mongoose.Schema(
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
      default: null,
    },
    portfolioScore: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100,
    },
    placementReadiness: {
      type: Number,
      required: true,
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
    careerReadiness: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Job Ready', 'Industry Ready'],
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
    careerAdvice: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const CareerIntelligence = mongoose.model('CareerIntelligence', careerIntelligenceSchema);
export default CareerIntelligence;
