import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
    },
    careerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CareerPath',
      required: true,
    },
    certificateId: {
      type: String,
      required: true,
      unique: true,
    },
    recipientName: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      default: 'NeuralMind Technologies',
    },
    roleTitle: {
      type: String,
      required: true,
    },
    grade: {
      type: Number,
      required: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      default: 'Active & Verified',
    },
  },
  {
    timestamps: true,
  }
);

const Certificate = mongoose.models.Certificate || mongoose.model('Certificate', certificateSchema);
export default Certificate;
