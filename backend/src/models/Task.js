import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    internshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true,
    },
    estimatedHours: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'under-review', 'completed'],
      default: 'todo',
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    objective: {
      type: String,
      default: '',
    },
    businessPurpose: {
      type: String,
      default: '',
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    resources: {
      type: [String],
      default: [],
    },
    requirements: {
      type: [String],
      default: [],
    },
    expectedOutput: {
      type: String,
      default: '',
    },
    evaluationCriteria: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'General',
    },
    deadlineDays: {
      type: Number,
      default: 3,
    },
    score: {
      type: Number,
      default: null,
    },
    feedback: {
      type: String,
      default: '',
    },
    categoryScore: {
      code: { type: Number, default: 0 },
      arch: { type: Number, default: 0 },
      perf: { type: Number, default: 0 },
      sec: { type: Number, default: 0 },
      doc: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model('Task', taskSchema);
export default Task;
