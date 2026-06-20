import axiosInstance from './axios.js';

/**
 * Retrieve GitHub profile data for the authenticated student.
 */
export const getProfile = async () => {
  const response = await axiosInstance.get('/api/github/profile');
  return response.data;
};

/**
 * Sync and fetch repositories from the student's connected GitHub account.
 */
export const getRepositories = async () => {
  const response = await axiosInstance.get('/api/github/repos');
  return response.data;
};

/**
 * Retrieve cached repository metadata details.
 */
export const getRepositoryDetails = async (repoId) => {
  const response = await axiosInstance.get(`/api/github/repos/${repoId}`);
  return response.data;
};

/**
 * Fetch language usage analysis for a repository.
 */
export const getRepositoryLanguages = async (repoId) => {
  const response = await axiosInstance.get(`/api/github/repos/${repoId}/languages`);
  return response.data;
};

/**
 * Fetch commit activity timeline metrics.
 */
export const getRepositoryCommits = async (repoId) => {
  const response = await axiosInstance.get(`/api/github/repos/${repoId}/commits`);
  return response.data;
};

/**
 * Fetch pull request analytics.
 */
export const getRepositoryPRs = async (repoId) => {
  const response = await axiosInstance.get(`/api/github/repos/${repoId}/pulls`);
  return response.data;
};

/**
 * Select active internship submission repository.
 */
export const selectRepository = async (repoData) => {
  const response = await axiosInstance.post('/api/github/select-repository', repoData);
  return response.data;
};

/**
 * Get active selected repository.
 */
export const getSelectedRepository = async () => {
  const response = await axiosInstance.get('/api/github/selected-repository');
  return response.data;
};

/**
 * Load directory files of a repository.
 */
export const getRepositoryFiles = async (repoId, path = '') => {
  const response = await axiosInstance.get(`/api/github/repos/${repoId}/files`, {
    params: { path },
  });
  return response.data;
};

/**
 * Retrieve code contents of a specific file inside a repository.
 */
export const getRepositoryFileContent = async (repoId, path) => {
  const response = await axiosInstance.get(`/api/github/repos/${repoId}/files/content`, {
    params: { path },
  });
  return response.data;
};

/**
 * Disconnects/unlinks the student's GitHub integration.
 */
export const disconnectGithub = async () => {
  const response = await axiosInstance.delete('/api/github/disconnect');
  return response.data;
};
