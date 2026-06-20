import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import jwt from 'jsonwebtoken';
import { jwtConfig } from './jwt.js';
import { encrypt } from '../utils/encryption.js';
import GithubProfile from '../models/GithubProfile.js';
import User from '../models/User.js';

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Configure Passport Strategy
const hasGithubCredentials = process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET;
if (!hasGithubCredentials) {
  console.warn('[Passport GitHub] WARNING: GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET is missing. GitHub integration is disabled or will fail.');
}

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || 'dummy_client_id',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'dummy_client_secret',
      callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/github/callback',
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Resolve student userId using session or URL query state parameter
        let userId = req.session?.userId;
        
        if (!userId && req.query?.state) {
          try {
            const decoded = jwt.verify(req.query.state, jwtConfig.accessSecret);
            userId = decoded.id;
          } catch (jwtErr) {
            console.error('[Passport GitHub] Error decoding state JWT:', jwtErr.message);
          }
        }

        if (!userId) {
          return done(new Error('User identity could not be verified. Please log in first.'));
        }

        // Encrypt GitHub token for storage
        const encryptedAccessToken = encrypt(accessToken);

        // Fetch user data to confirm existence
        const userObj = await User.findById(userId);
        if (!userObj) {
          return done(new Error('No matching user account found.'));
        }

        // Parse profile payload
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
        const profileData = {
          userId,
          githubId: profile.id,
          username: profile.username,
          displayName: profile.displayName || profile.username,
          avatar: profile._json.avatar_url || '',
          profileUrl: profile.profileUrl || profile._json.html_url || '',
          email: email || userObj.email, // fallback to registered user email
          accessToken: encryptedAccessToken,
          followers: profile._json.followers || 0,
          following: profile._json.following || 0,
          publicRepos: profile._json.public_repos || 0,
          connectedAt: new Date(),
          lastSync: new Date(),
        };

        // Upsert GitHub Profile
        const githubProfile = await GithubProfile.findOneAndUpdate(
          { userId },
          profileData,
          { returnDocument: 'after', upsert: true }
        );

        // Link User record directly (prevents resetting unselected fields like refreshToken)
        await User.findByIdAndUpdate(userId, { githubId: profile.id });

        return done(null, githubProfile);
      } catch (error) {
        console.error('[Passport GitHub] Strategy callback error:', error);
        return done(error);
      }
    }
  )
);
