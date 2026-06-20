import mongoose from 'mongoose';

const interviewAnswerSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewQuestion',
      required: true,
    },
    answer: {
      type: String,
      default: '',
    },
    transcript: {
      type: String,
      default: '',
    },
    duration: {
      type: Number,
      default: 0, // In seconds
    },
  },
  {
    timestamps: true,
  }
);

const InterviewAnswer = mongoose.model('InterviewAnswer', interviewAnswerSchema);
export default InterviewAnswer;
