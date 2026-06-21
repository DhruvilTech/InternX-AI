import mongoose from 'mongoose';

const hiringPipelineSchema = new mongoose.Schema(
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
    stage: {
      type: String,
      enum: ['applied', 'shortlisted', 'interviewing', 'offered', 'rejected'],
      default: 'shortlisted',
    },
    notes: {
      type: String,
      default: '',
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate pipeline records for a student per recruiter
hiringPipelineSchema.index({ recruiterId: 1, studentId: 1 }, { unique: true });

const HiringPipeline = mongoose.model('HiringPipeline', hiringPipelineSchema);
export default HiringPipeline;
