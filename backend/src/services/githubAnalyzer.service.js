import axios from 'axios';
import {
  fetchRepoLanguages,
  fetchCommits,
  fetchRepositoryFiles,
  fetchFileContent
} from './github.service.js';

/**
 * Extracts owner and repository name from a GitHub URL.
 * Supports trailing slash and .git formats.
 */
export const parseGithubUrl = (url) => {
  if (!url) return null;
  // Match github.com/owner/repo
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (match) {
    const owner = match[1];
    let repo = match[2].split('#')[0].split('?')[0]; // strip query parameters
    if (repo.endsWith('.git')) {
      repo = repo.slice(0, -4);
    }
    if (repo.endsWith('/')) {
      repo = repo.slice(0, -1);
    }
    return { owner, repo };
  }
  return null;
};

/**
 * Performs a comprehensive scan of a GitHub repository.
 * Uses the decypted access token of the student, or falls back to public API calls.
 * 
 * @param {string} url The GitHub repository URL
 * @param {string} [accessToken] Student's decrypted GitHub token
 * @returns {object} Analysed metadata and structure
 */
export const analyzeGithubRepository = async (url, accessToken, branch = '', commitHash = '') => {
  const parsed = parseGithubUrl(url);
  if (!parsed) {
    throw new Error('Invalid GitHub repository URL. Must be in the format: https://github.com/owner/repo');
  }

  const { owner, repo } = parsed;
  const stats = {
    exists: false,
    owner,
    repo,
    readmeContent: '',
    commitsCount: 0,
    branchCount: 0,
    contributors: 0,
    languages: {},
    fileCount: 0,
    folderStructure: [],
    technologies: [],
    fileSnippets: [],
    categories: {
      controllers: [],
      models: [],
      routes: [],
      middlewares: [],
      services: [],
      components: [],
      pages: [],
      utilities: [],
      config: []
    }
  };

  try {
    let client = axios.create({ baseURL: 'https://api.github.com' });
    if (accessToken) {
      client.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    }

    // 1. Verify Repo Exists and Fetch Metadata
    const repoRes = await client.get(`/repos/${owner}/${repo}`);
    stats.exists = true;
    
    // Check if repository is private
    if (repoRes.data.private) {
      throw new Error('Evaluation Failed. Repository is private. Only public repositories can be evaluated.');
    }

    stats.description = repoRes.data.description || '';
    stats.size = repoRes.data.size;
    stats.defaultBranch = repoRes.data.default_branch || 'main';

    const targetRef = commitHash || branch || stats.defaultBranch;

    // 2. Fetch README
    try {
      const readmeRes = await client.get(`/repos/${owner}/${repo}/readme`, {
        params: { ref: targetRef }
      });
      if (readmeRes.data && readmeRes.data.content) {
        const decoded = Buffer.from(readmeRes.data.content, 'base64').toString('utf8');
        stats.readmeContent = decoded.slice(0, 4000); // Cap size for token safety
      }
    } catch (e) {
      console.warn(`[GitHub Analyze] Could not fetch README for ${owner}/${repo}:`, e.message);
    }

    // 3. Fetch Languages
    try {
      const langRes = await client.get(`/repos/${owner}/${repo}/languages`);
      stats.languages = langRes.data || {};
      stats.technologies = Object.keys(stats.languages);
    } catch (e) {
      console.warn(`[GitHub Analyze] Could not fetch languages:`, e.message);
    }

    // 4. Fetch Commits
    try {
      const commitsRes = await client.get(`/repos/${owner}/${repo}/commits`, { params: { sha: targetRef, per_page: 50 } });
      stats.commitsCount = Array.isArray(commitsRes.data) ? commitsRes.data.length : 0;
    } catch (e) {
      console.warn(`[GitHub Analyze] Could not fetch commits:`, e.message);
    }

    // Fetch Branch Count
    try {
      const branchesRes = await client.get(`/repos/${owner}/${repo}/branches`);
      stats.branchCount = Array.isArray(branchesRes.data) ? branchesRes.data.length : 1;
    } catch (e) {
      console.warn(`[GitHub Analyze] Could not fetch branches:`, e.message);
      stats.branchCount = 1;
    }

    // Fetch Contributors Count
    try {
      const contributorsRes = await client.get(`/repos/${owner}/${repo}/contributors`);
      stats.contributors = Array.isArray(contributorsRes.data) ? contributorsRes.data.length : 1;
    } catch (e) {
      console.warn(`[GitHub Analyze] Could not fetch contributors:`, e.message);
      stats.contributors = 1;
    }

    // 5. Fetch File Tree (recursively or flat)
    try {
      const treeRes = await client.get(`/repos/${owner}/${repo}/git/trees/${targetRef}?recursive=1`);
      if (treeRes.data && Array.isArray(treeRes.data.tree)) {
        const tree = treeRes.data.tree;
        stats.fileCount = tree.filter(f => f.type === 'blob').length;

        // Verify there is at least one source code file
        const codeFiles = tree.filter(f => {
          if (f.type !== 'blob') return false;
          const ext = f.path.split('.').pop() || '';
          return ['js', 'jsx', 'ts', 'tsx', 'py', 'go', 'java', 'cpp', 'c', 'php'].includes(ext.toLowerCase());
        });

        if (codeFiles.length === 0) {
          throw new Error('Evaluation Failed. No source code detected.');
        }

        const pathList = [];
        const keyFilesToFetch = [];

        tree.forEach(node => {
          const path = node.path;
          const filename = path.split('/').pop() || path;
          const lowerPath = path.toLowerCase();

          if (node.type === 'tree') {
            pathList.push(`[DIR] ${path}`);
          } else {
            pathList.push(`[FILE] ${path}`);
            
            // Group code files
            if (lowerPath.includes('/controllers/') || filename.includes('controller')) {
              stats.categories.controllers.push(filename);
            } else if (lowerPath.includes('/models/') || filename.includes('model')) {
              stats.categories.models.push(filename);
            } else if (lowerPath.includes('/routes/') || filename.includes('route')) {
              stats.categories.routes.push(filename);
            } else if (lowerPath.includes('/middlewares/') || filename.includes('middleware')) {
              stats.categories.middlewares.push(filename);
            } else if (lowerPath.includes('/services/') || filename.includes('service')) {
              stats.categories.services.push(filename);
            } else if (lowerPath.includes('/components/') || filename.includes('component')) {
              stats.categories.components.push(filename);
            } else if (lowerPath.includes('/pages/') || filename.includes('page')) {
              stats.categories.pages.push(filename);
            } else if (lowerPath.includes('/utils/') || lowerPath.includes('/helpers/')) {
              stats.categories.utilities.push(filename);
            } else if (lowerPath.includes('/config/') || filename.includes('config')) {
              stats.categories.config.push(filename);
            }

            // Identify key source code files to fetch content for evaluation (max 5)
            const fileExt = filename.split('.').pop() || '';
            const isCodeFile = ['js', 'jsx', 'ts', 'tsx', 'py', 'go', 'java', 'cpp', 'html', 'css'].includes(fileExt.toLowerCase());
            const isNotMeta = !lowerPath.includes('node_modules') && 
                              !lowerPath.includes('package-lock.json') && 
                              !lowerPath.includes('dist') && 
                              !lowerPath.includes('build') && 
                              !lowerPath.includes('.git') &&
                              filename.toLowerCase() !== 'readme.md' &&
                              filename.toLowerCase() !== 'package.json';
            
            if (isCodeFile && isNotMeta && keyFilesToFetch.length < 5) {
              keyFilesToFetch.push(path);
            }
          }
        });

        stats.folderStructure = pathList.slice(0, 150);
        if (pathList.length > 150) {
          stats.folderStructure.push(`... and ${pathList.length - 150} more files`);
        }

        // Fetch snippets
        for (const filePath of keyFilesToFetch) {
          try {
            const fileData = await fetchFileContent(accessToken, owner, repo, filePath, targetRef);
            if (fileData && fileData.content && fileData.content.trim()) {
              stats.fileSnippets.push({
                path: filePath,
                content: fileData.content.slice(0, 1500)
              });
            }
          } catch (fetchErr) {
            console.warn(`[GitHub Analyze] Could not fetch file content for ${filePath}:`, fetchErr.message);
          }
        }
      }
    } catch (e) {
      if (e.message.includes('Evaluation Failed.')) {
        throw e;
      }
      // Fallback if git tree recursive isn't allowed or fails
      console.warn(`[GitHub Analyze] Could not fetch recursive file tree:`, e.message);
      try {
        const contentsRes = await client.get(`/repos/${owner}/${repo}/contents`, { params: { ref: targetRef } });
        if (Array.isArray(contentsRes.data)) {
          stats.fileCount = contentsRes.data.length;
          stats.folderStructure = contentsRes.data.map(item => `${item.type === 'dir' ? '[DIR]' : '[FILE]'} ${item.path}`);

          const fallbackFiles = contentsRes.data.filter(item => {
            if (item.type !== 'file') return false;
            const path = item.path;
            const lowerPath = path.toLowerCase();
            const filename = path.split('/').pop() || path;
            const fileExt = filename.split('.').pop() || '';
            const isCodeFile = ['js', 'jsx', 'ts', 'tsx', 'py', 'go', 'java', 'cpp', 'html', 'css'].includes(fileExt.toLowerCase());
            return isCodeFile && 
                   !lowerPath.includes('node_modules') && 
                   !lowerPath.includes('package-lock.json') && 
                   filename.toLowerCase() !== 'readme.md' &&
                   filename.toLowerCase() !== 'package.json';
          }).slice(0, 5);

          for (const f of fallbackFiles) {
            try {
              const fileData = await fetchFileContent(accessToken, owner, repo, f.path, targetRef);
              if (fileData && fileData.content && fileData.content.trim()) {
                stats.fileSnippets.push({
                  path: f.path,
                  content: fileData.content.slice(0, 1500)
                });
              }
            } catch (fetchErr) {
              console.warn(`[GitHub Analyze] Could not fetch fallback file content for ${f.path}:`, fetchErr.message);
            }
          }
        }
      } catch (innerErr) {
        console.error(`[GitHub Analyze] Content fallback failed:`, innerErr.message);
      }
    }

    return stats;
  } catch (error) {
    console.error(`[GitHub Analyze] Failed to analyze repository: ${url}`, error);
    throw new Error(`Failed to audit GitHub repository: ${error.response?.data?.message || error.message}`);
  }
};
