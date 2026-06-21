import mongoose from 'mongoose';

const githubProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    githubId: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    profileUrl: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    accessToken: {
      type: String,
      required: true,
    },
    connectedAt: {
      type: Date,
      default: Date.now,
    },
    followers: {
      type: Number,
      default: 0,
    },
    following: {
      type: Number,
      default: 0,
    },
    publicRepos: {
      type: Number,
      default: 0,
    },
    lastSync: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const GithubProfile = mongoose.model('GithubProfile', githubProfileSchema);
export default GithubProfile;
