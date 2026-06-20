import mongoose from 'mongoose';

const internshipSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    industry: {
      type: String,
      required: true,
      trim: true,
    },
    companyDescription: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    workCulture: {
      type: String,
      required: true,
      trim: true,
    },
    managerName: {
      type: String,
      required: true,
      trim: true,
    },
    managerRole: {
      type: String,
      required: true,
      trim: true,
    },
    managerIntroduction: {
      type: String,
      required: true,
      trim: true,
    },
    projectName: {
      type: String,
      required: true,
      trim: true,
    },
    projectDescription: {
      type: String,
      required: true,
      trim: true,
    },
    welcomeMessage: {
      type: String,
      default: '',
    },
    internshipDuration: {
      type: String,
      default: '',
    },
    internshipRole: {
      type: String,
      default: '',
    },
    expectedLearningOutcomes: {
      type: [String],
      default: [],
    },
    businessProblem: {
      type: String,
      default: '',
    },
    technicalRequirements: {
      type: [String],
      default: [],
    },
    successCriteria: {
      type: [String],
      default: [],
    },
    roadmap: {
      type: Map,
      of: [String],
      default: {},
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

const Internship = mongoose.model('Internship', internshipSchema);
export default Internship;
