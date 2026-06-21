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

const Offer = mongoose.model('Offer', offerSchema);
export default Offer;
