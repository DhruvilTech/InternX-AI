import mongoose from 'mongoose';

const placementSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    jobRole: {
      type: String,
      required: true,
    },
    offerStatus: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    package: {
      type: Number,
      required: true,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Performance indexes for college dashboard and recruiter queries
placementSchema.index({ collegeId: 1, offerStatus: 1 });
placementSchema.index({ studentId: 1 });
placementSchema.index({ recruiterId: 1 });
placementSchema.index({ createdAt: -1 });

const Placement = mongoose.models.Placement || mongoose.model('Placement', placementSchema);
export default Placement;
