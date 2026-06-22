import mongoose from 'mongoose';

const mentorChatSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mentorId: {
      type: String,
      default: 'AI_Mentor',
    },
    message: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['student', 'mentor'],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'mentor_chats',
  }
);

const MentorChat = mongoose.model('MentorChat', mentorChatSchema);
export default MentorChat;
