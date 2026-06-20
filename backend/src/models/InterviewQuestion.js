import mongoose from 'mongoose';

const interviewQuestionSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Technical', 'Behavioral', 'HR'],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const InterviewQuestion = mongoose.model('InterviewQuestion', interviewQuestionSchema);
export default InterviewQuestion;
