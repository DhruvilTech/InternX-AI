import mongoose from 'mongoose';

const shortlistedCandidateSchema = new mongoose.Schema(
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
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate shortlists
shortlistedCandidateSchema.index({ recruiterId: 1, studentId: 1 }, { unique: true });

const ShortlistedCandidate = mongoose.model('ShortlistedCandidate', shortlistedCandidateSchema);
export default ShortlistedCandidate;
