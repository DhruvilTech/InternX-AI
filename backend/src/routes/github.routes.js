import express from 'express';
import {
  connectGithub,
  oauthCallback,
  getProfile,
  getRepos,
  getRepoDetails,
  getLanguages,
  getCommits,
  getPullRequests,
  selectRepository,
  getSelectedRepository,
  getFiles,
  getFileContent,
  disconnectGithubAccount,
} from '../controllers/github.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import { requireGithubConnection } from '../middlewares/github.middleware.js';

const router = express.Router();

// OAuth initiation: Token passed via query string
router.get('/connect', connectGithub);

// OAuth callback: Verified by passport-github session/state
router.get('/callback', oauthCallback);

// Protected student-only endpoints
router.use(protect);
router.use(authorizeRoles('student'));

// Selection state checks
router.get('/selected-repository', getSelectedRepository);
router.post('/select-repository', requireGithubConnection, selectRepository);
router.delete('/disconnect', disconnectGithubAccount);

// Repository analytics and exploration (Requires GitHub connection middleware)
router.use(requireGithubConnection);

router.get('/profile', getProfile);
router.get('/repos', getRepos);
router.get('/repos/:repoId', getRepoDetails);
router.get('/repos/:repoId/languages', getLanguages);
router.get('/repos/:repoId/commits', getCommits);
router.get('/repos/:repoId/pulls', getPullRequests);
router.get('/repos/:repoId/files', getFiles);
router.get('/repos/:repoId/files/content', getFileContent);

export default router;
