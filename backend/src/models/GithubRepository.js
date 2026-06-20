import mongoose from 'mongoose';

const githubRepositorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    githubId: {
      type: String,
      default: '',
    },
    repoId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      default: 'Unknown',
    },
    visibility: {
      type: String,
      default: 'public',
    },
    stars: {
      type: Number,
      default: 0,
    },
    forks: {
      type: Number,
      default: 0,
    },
    watchers: {
      type: Number,
      default: 0,
    },
    openIssues: {
      type: Number,
      default: 0,
    },
    defaultBranch: {
      type: String,
      default: 'main',
    },
    repoUrl: {
      type: String,
      default: '',
    },
    createdAtGithub: {
      type: Date,
    },
    updatedAtGithub: {
      type: Date,
    },
    lastPush: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness per user repository cached
githubRepositorySchema.index({ userId: 1, repoId: 1 }, { unique: true });

const GithubRepository = mongoose.model('GithubRepository', githubRepositorySchema);
export default GithubRepository;
