import GithubProfile from '../models/GithubProfile.js';
import { decrypt } from '../utils/encryption.js';

/**
 * Middleware to verify that a student has integrated their GitHub account.
 * Decrypts their access token and attaches both profile and token to req object.
 */
export const requireGithubConnection = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User details not loaded.',
      });
    }

    // Retrieve active profile
    const profile = await GithubProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(400).json({
        success: false,
        message: 'GitHub account not connected. Please connect your account first.',
      });
    }

    // Decrypt token
    const token = decrypt(profile.accessToken);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'GitHub credentials expired. Please reconnect your account.',
      });
    }

    // Attach to request context
    req.githubProfile = profile;
    req.githubAccessToken = token;

    next();
  } catch (error) {
    console.error('[GitHub Middleware] Connection verification error:', error);
    next(error);
  }
};
