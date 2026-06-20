import mongoose from 'mongoose';

const githubContributionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    repoId: {
      type: String,
      required: true,
    },
    commitCount: {
      type: Number,
      default: 0,
    },
    pullRequestCount: {
      type: Number,
      default: 0,
    },
    issueCount: {
      type: Number,
      default: 0,
    },
    languageBreakdown: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    contributionScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness per user repository contribution
githubContributionSchema.index({ userId: 1, repoId: 1 }, { unique: true });

const GithubContribution = mongoose.model('GithubContribution', githubContributionSchema);
export default GithubContribution;
