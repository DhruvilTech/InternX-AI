import mongoose from 'mongoose';

const submissionRepositorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // Only one active selected repository per student
    },
    repoId: {
      type: String,
      required: true,
    },
    repositoryName: {
      type: String,
      required: true,
    },
    branch: {
      type: String,
      required: true,
    },
    selectedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const SubmissionRepository = mongoose.model('SubmissionRepository', submissionRepositorySchema);
export default SubmissionRepository;
