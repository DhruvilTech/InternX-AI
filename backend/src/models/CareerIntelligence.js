import mongoose from 'mongoose';

const careerIntelligenceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    readinessScore: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100,
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
    recommendedRoles: {
      type: [String],
      default: [],
    },
    recommendedSkills: {
      type: [String],
      default: [],
    },
    recommendedProjects: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          default: '',
        },
        complexity: {
          type: String,
          default: 'Intermediate',
        },
      },
    ],
    recommendedCertifications: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const CareerIntelligence = mongoose.model('CareerIntelligence', careerIntelligenceSchema);
export default CareerIntelligence;
