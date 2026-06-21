import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recruiterName: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    jobRole: {
      type: String,
      default: 'Software Engineer Intern',
    },
    package: {
      type: Number,
      default: 6,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for the most common query patterns
offerSchema.index({ recruiterId: 1, status: 1 });
offerSchema.index({ studentId: 1, status: 1 });
offerSchema.index({ createdAt: -1 });

const Offer = mongoose.model('Offer', offerSchema);
export default Offer;
