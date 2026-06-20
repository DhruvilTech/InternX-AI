import { getGithubClient } from '../utils/githubApi.js';

/**
 * Service to retrieve the connected GitHub user's profile metadata.
 */
export const fetchProfile = async (accessToken) => {
  const client = getGithubClient(accessToken);
  const response = await client.get('/user');
  return response.data;
};

/**
 * Service to retrieve a user's repositories from GitHub.
 */
export const fetchRepos = async (accessToken) => {
  const client = getGithubClient(accessToken);
  const response = await client.get('/user/repos', {
    params: {
      per_page: 100,
      sort: 'updated',
    },
  });
  return response.data;
};

/**
 * Service to retrieve language bytes for a specific repository.
 */
export const fetchRepoLanguages = async (accessToken, owner, repo) => {
  const client = getGithubClient(accessToken);
  const response = await client.get(`/repos/${owner}/${repo}/languages`);
  return response.data;
};

/**
 * Service to retrieve recent commits for a repository.
 */
export const fetchCommits = async (accessToken, owner, repo) => {
  const client = getGithubClient(accessToken);
  const response = await client.get(`/repos/${owner}/${repo}/commits`, {
    params: {
      per_page: 100,
    },
  });
  return response.data;
};

/**
 * Service to retrieve pull requests for a repository.
 */
export const fetchPullRequests = async (accessToken, owner, repo) => {
  const client = getGithubClient(accessToken);
  const response = await client.get(`/repos/${owner}/${repo}/pulls`, {
    params: {
      state: 'all',
      per_page: 100,
    },
  });
  return response.data;
};

/**
 * Service to fetch folder/file tree structures via the GitHub Contents API.
 */
export const fetchRepositoryFiles = async (accessToken, owner, repo, path = '') => {
  const client = getGithubClient(accessToken);
  const endpoint = `/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`;
  const response = await client.get(endpoint);
  return response.data;
};

/**
 * Service to retrieve the content of a specific file.
 */
export const fetchFileContent = async (accessToken, owner, repo, path) => {
  const client = getGithubClient(accessToken);
  const endpoint = `/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`;
  const response = await client.get(endpoint);
  
  // GitHub returns file contents base64 encoded if type is file
  if (response.data && response.data.type === 'file' && response.data.content) {
    const cleanContent = response.data.content.replace(/\r?\n|\r/g, '');
    const decodedCode = Buffer.from(cleanContent, 'base64').toString('utf8');
    return {
      name: response.data.name,
      path: response.data.path,
      size: response.data.size,
      downloadUrl: response.data.download_url,
      content: decodedCode,
    };
  }
  
  return response.data;
};
