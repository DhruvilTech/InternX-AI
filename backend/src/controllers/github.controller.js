import passport from 'passport';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';
import * as githubService from '../services/github.service.js';
import GithubProfile from '../models/GithubProfile.js';
import GithubRepository from '../models/GithubRepository.js';
import GithubContribution from '../models/GithubContribution.js';
import SubmissionRepository from '../models/SubmissionRepository.js';
import User from '../models/User.js';
import { sendResponse } from '../utils/sendResponse.js';

/**
 * Initiates the GitHub OAuth sequence.
 * Extracts the user token to persist user identification in express-session.
 */
export const connectGithub = (req, res, next) => {
  // Capture JWT token from query parameter to authenticate user stateless session
  const token = req.query.token;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authorization token is required to connect GitHub.' });
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.accessSecret);
    
    // Enforce role protection (Student-only connection)
    if (decoded.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Only student accounts are allowed to integrate GitHub.',
      });
    }

    req.session.userId = decoded.id;
    
    // Pass JWT token inside OAuth state parameter to ensure callback verification fallback
    passport.authenticate('github', {
      state: token,
      scope: ['user:email', 'read:user', 'repo'],
    })(req, res, next);
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authorization token.' });
  }
};

/**
 * Handles the GitHub OAuth redirect callback.
 * Authenticates user, synchronizes profile record, and redirects back to the React dashboard.
 */
export const oauthCallback = (req, res, next) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  
  passport.authenticate('github', {
    session: true,
    failureRedirect: `${clientUrl}/#/dashboard/github?error=OAuthFailed`,
  }, (err, profile) => {
    if (err || !profile) {
      console.error('[GitHub Controller] OAuth callback strategy failed:', err);
      return res.redirect(`${clientUrl}/#/dashboard/github?error=OAuthFailed`);
    }
    
    // Successful connection redirect
    return res.redirect(`${clientUrl}/#/dashboard/github?success=true`);
  })(req, res, next);
};

/**
 * Retrieves the connected GitHub profile of the logged-in user.
 */
export const getProfile = async (req, res, next) => {
  try {
    const profile = req.githubProfile.toObject();
    // Delete access token so it is never exposed to the client
    delete profile.accessToken;
    
    return sendResponse(res, 200, true, 'GitHub profile retrieved successfully', profile);
  } catch (error) {
    next(error);
  }
};

/**
 * Syncs and lists the user's repositories.
 * Caches repository metadata in MongoDB to minimize API rate limit depletion.
 */
export const getRepos = async (req, res, next) => {
  try {
    const reposData = await githubService.fetchRepos(req.githubAccessToken);
    const syncedRepos = [];

    for (const repo of reposData) {
      const repoPayload = {
        userId: req.user._id,
        githubId: req.githubProfile.githubId,
        repoId: repo.id.toString(),
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description || '',
        language: repo.language || 'Unknown',
        visibility: repo.private ? 'private' : 'public',
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        watchers: repo.watchers_count || 0,
        openIssues: repo.open_issues_count || 0,
        defaultBranch: repo.default_branch || 'main',
        repoUrl: repo.html_url || '',
        createdAtGithub: repo.created_at,
        updatedAtGithub: repo.updated_at,
        lastPush: repo.pushed_at,
      };

      const savedRepo = await GithubRepository.findOneAndUpdate(
        { userId: req.user._id, repoId: repo.id.toString() },
        repoPayload,
        { returnDocument: 'after', upsert: true }
      );
      syncedRepos.push(savedRepo);
    }

    return sendResponse(res, 200, true, 'Repositories synchronized and retrieved successfully', syncedRepos);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves cached repository metadata.
 */
export const getRepoDetails = async (req, res, next) => {
  try {
    const { repoId } = req.params;
    const repo = await GithubRepository.findOne({ userId: req.user._id, repoId });
    
    if (!repo) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found in local cache. Please sync repositories.',
      });
    }

    return sendResponse(res, 200, true, 'Repository metadata retrieved successfully', repo);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves the language distribution analytics for a specific repository.
 * Stores breakdown percentages inside GithubContribution.
 */
export const getLanguages = async (req, res, next) => {
  try {
    const { repoId } = req.params;
    const repo = await GithubRepository.findOne({ userId: req.user._id, repoId });
    if (!repo) {
      return res.status(404).json({ success: false, message: 'Repository not found.' });
    }

    const [owner, name] = repo.fullName.split('/');
    const languages = await githubService.fetchRepoLanguages(req.githubAccessToken, owner, name);

    // Calculate percentage breakdown
    const totalBytes = Object.values(languages).reduce((sum, val) => sum + val, 0);
    const breakdown = {};
    if (totalBytes > 0) {
      for (const [lang, bytes] of Object.entries(languages)) {
        breakdown[lang] = parseFloat(((bytes / totalBytes) * 100).toFixed(2));
      }
    }

    // Save language metrics
    let contrib = await GithubContribution.findOne({ userId: req.user._id, repoId });
    if (!contrib) {
      contrib = new GithubContribution({ userId: req.user._id, repoId });
    }
    contrib.languageBreakdown = breakdown;
    contrib.contributionScore = (contrib.commitCount * 3) + (contrib.pullRequestCount * 5) + (contrib.issueCount * 2);
    await contrib.save();

    return sendResponse(res, 200, true, 'Language analytics compiled successfully', {
      breakdown,
      rawBytes: languages,
      totalBytes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Gathers commit history analytics, updates contribution statistics, and builds timeline.
 */
export const getCommits = async (req, res, next) => {
  try {
    const { repoId } = req.params;
    const repo = await GithubRepository.findOne({ userId: req.user._id, repoId });
    if (!repo) {
      return res.status(404).json({ success: false, message: 'Repository not found.' });
    }

    const [owner, name] = repo.fullName.split('/');
    const commits = await githubService.fetchCommits(req.githubAccessToken, owner, name);

    // Calculate commit metrics
    const totalCommits = commits.length;
    const githubUsername = req.githubProfile.username;
    
    // Filter commits belonging to this user
    const userCommits = commits.filter(
      (c) => c.author?.login === githubUsername || c.commit?.author?.name === githubUsername
    );
    const userCommitCount = userCommits.length;

    // Recent 5 commits
    const recentCommits = commits.slice(0, 5).map((c) => ({
      sha: c.sha,
      message: c.commit.message,
      authorName: c.commit.author.name,
      date: c.commit.author.date,
      url: c.html_url,
    }));

    // Group commits by day for timeline chart
    const timelineMap = {};
    commits.forEach((c) => {
      const dateStr = new Date(c.commit.author.date).toISOString().split('T')[0];
      timelineMap[dateStr] = (timelineMap[dateStr] || 0) + 1;
    });

    const commitTimeline = Object.entries(timelineMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Update GithubContribution
    let contrib = await GithubContribution.findOne({ userId: req.user._id, repoId });
    if (!contrib) {
      contrib = new GithubContribution({ userId: req.user._id, repoId });
    }
    contrib.commitCount = userCommitCount;
    contrib.contributionScore = (contrib.commitCount * 3) + (contrib.pullRequestCount * 5) + (contrib.issueCount * 2);
    await contrib.save();

    return sendResponse(res, 200, true, 'Commit analytics compiled successfully', {
      totalCommits,
      userCommitCount,
      recentCommits,
      commitTimeline,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Gathers Pull Request analytics, calculates merge rates, and updates contribution score.
 */
export const getPullRequests = async (req, res, next) => {
  try {
    const { repoId } = req.params;
    const repo = await GithubRepository.findOne({ userId: req.user._id, repoId });
    if (!repo) {
      return res.status(404).json({ success: false, message: 'Repository not found.' });
    }

    const [owner, name] = repo.fullName.split('/');
    const pulls = await githubService.fetchPullRequests(req.githubAccessToken, owner, name);

    let openPRs = 0;
    let closedPRs = 0;
    let mergedPRs = 0;
    let userPRsCount = 0;
    const githubUsername = req.githubProfile.username;

    pulls.forEach((p) => {
      if (p.state === 'open') {
        openPRs += 1;
      } else if (p.state === 'closed') {
        if (p.merged_at) {
          mergedPRs += 1;
        } else {
          closedPRs += 1;
        }
      }

      if (p.user?.login === githubUsername) {
        userPRsCount += 1;
      }
    });

    // Merge Rate Calculation
    const totalClosed = closedPRs + mergedPRs;
    const mergeRate = totalClosed > 0 ? parseFloat(((mergedPRs / totalClosed) * 100).toFixed(2)) : 0;

    // Update GithubContribution
    let contrib = await GithubContribution.findOne({ userId: req.user._id, repoId });
    if (!contrib) {
      contrib = new GithubContribution({ userId: req.user._id, repoId });
    }
    contrib.pullRequestCount = userPRsCount;
    contrib.contributionScore = (contrib.commitCount * 3) + (contrib.pullRequestCount * 5) + (contrib.issueCount * 2);
    await contrib.save();

    return sendResponse(res, 200, true, 'Pull request analytics compiled successfully', {
      openPRs,
      closedPRs,
      mergedPRs,
      userPRsCount,
      mergeRate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Selects a repository as the active internship submission repository.
 */
export const selectRepository = async (req, res, next) => {
  try {
    const { repoId, repositoryName, branch } = req.body;
    if (!repoId || !repositoryName || !branch) {
      return res.status(400).json({
        success: false,
        message: 'Missing repository connection metadata (repoId, repositoryName, branch).',
      });
    }

    const selectedRepo = await SubmissionRepository.findOneAndUpdate(
      { userId: req.user._id },
      { repoId, repositoryName, branch, selectedAt: new Date() },
      { returnDocument: 'after', upsert: true }
    );

    return sendResponse(res, 200, true, 'Active internship repository updated successfully', selectedRepo);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves the user's active selected repository details.
 */
export const getSelectedRepository = async (req, res, next) => {
  try {
    const selectedRepo = await SubmissionRepository.findOne({ userId: req.user._id });
    return sendResponse(res, 200, true, 'Active selected repository retrieved successfully', selectedRepo);
  } catch (error) {
    next(error);
  }
};

/**
 * Explores files and directories inside a repository.
 */
export const getFiles = async (req, res, next) => {
  try {
    const { repoId } = req.params;
    const { path } = req.query;
    
    const repo = await GithubRepository.findOne({ userId: req.user._id, repoId });
    if (!repo) {
      return res.status(404).json({ success: false, message: 'Repository not found.' });
    }

    const [owner, name] = repo.fullName.split('/');
    const files = await githubService.fetchRepositoryFiles(req.githubAccessToken, owner, name, path || '');

    // Map contents payload to relevant explorer metadata
    const directoryTree = files.map((f) => ({
      name: f.name,
      path: f.path,
      type: f.type, // 'file' or 'dir'
      size: f.size,
      downloadUrl: f.download_url,
    }));

    return sendResponse(res, 200, true, 'Directory tree loaded successfully', directoryTree);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves the code contents of a specific file inside a repository.
 */
export const getFileContent = async (req, res, next) => {
  try {
    const { repoId } = req.params;
    const { path } = req.query;
    
    if (!path) {
      return res.status(400).json({ success: false, message: 'File path parameter is required.' });
    }

    const repo = await GithubRepository.findOne({ userId: req.user._id, repoId });
    if (!repo) {
      return res.status(404).json({ success: false, message: 'Repository not found.' });
    }

    const [owner, name] = repo.fullName.split('/');
    const filePayload = await githubService.fetchFileContent(req.githubAccessToken, owner, name, path);

    return sendResponse(res, 200, true, 'File content retrieved successfully', filePayload);
  } catch (error) {
    next(error);
  }
};

/**
 * Disconnects the student's GitHub integration.
 * Clears profile records, cache repositories, stats, and unlinks the User account.
 */
export const disconnectGithubAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Delete GithubProfile connection
    await GithubProfile.deleteOne({ userId });

    // 2. Clear User githubId link
    await User.findByIdAndUpdate(userId, { githubId: null });

    // 3. Purge cached GithubRepository records
    await GithubRepository.deleteMany({ userId });

    // 4. Purge cached GithubContribution records
    await GithubContribution.deleteMany({ userId });

    // 5. Delete SubmissionRepository selection
    await SubmissionRepository.deleteOne({ userId });

    return sendResponse(res, 200, true, 'GitHub connection disconnected successfully.');
  } catch (error) {
    next(error);
  }
};
