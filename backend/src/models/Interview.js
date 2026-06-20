import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    internshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship',
      default: null,
    },
    careerPath: {
      type: String,
      required: true,
    },
    interviewType: {
      type: String,
      enum: ['technical', 'behavioral', 'hr', 'mixed'],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
    },
    totalQuestions: {
      type: Number,
      default: 10,
    },
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;
