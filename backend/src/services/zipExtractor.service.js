import AdmZip from 'adm-zip';

/**
 * Service to inspect ZIP file streams in memory.
 * Extracts the file tree, README files, package configurations,
 * and groups files into controllers, models, routes, services, pages, components, and utilities.
 * 
 * @param {string} base64Data Base64 encoded zip file string
 * @returns {object} Extracted metadata, code structure, and content summaries
 */
export const extractZipMetadata = async (base64Data) => {
  try {
    const cleanBase64 = base64Data.replace(/^data:application\/zip;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();

    const result = {
      fileCount: 0,
      folderStructure: [],
      readmeContent: '',
      packageDependencies: {},
      technologies: [],
      fileSnippets: [],
      categories: {
        controllers: [],
        models: [],
        routes: [],
        components: [],
        pages: [],
        services: [],
        utilities: []
      }
    };

    const treeList = [];

    for (const entry of entries) {
      const path = entry.entryName;
      if (entry.isDirectory) {
        treeList.push(`[DIR] ${path}`);
        continue;
      }

      result.fileCount++;
      treeList.push(`[FILE] ${path}`);

      const lowerPath = path.toLowerCase();
      const filename = path.split('/').pop() || path;
      const fileExt = filename.split('.').pop() || '';

      // Extract README.md
      if (filename.toLowerCase() === 'readme.md') {
        const fullContent = entry.getData().toString('utf8');
        result.readmeContent = fullContent.slice(0, 4000); // Cap size for token safety
      }

      // Extract package dependencies
      if (filename.toLowerCase() === 'package.json') {
        try {
          const pkgJson = JSON.parse(entry.getData().toString('utf8'));
          result.packageDependencies = {
            dependencies: pkgJson.dependencies || {},
            devDependencies: pkgJson.devDependencies || {}
          };
          if (pkgJson.dependencies) {
            Object.keys(pkgJson.dependencies).forEach(dep => {
              if (!result.technologies.includes(dep)) {
                result.technologies.push(dep);
              }
            });
          }
        } catch (err) {
          console.warn('[ZIP Extract] Failed to parse package.json:', err.message);
        }
      }

      // Group key project blocks
      if (lowerPath.includes('/controllers/') || filename.includes('controller')) {
        result.categories.controllers.push(filename);
      } else if (lowerPath.includes('/models/') || filename.includes('model')) {
        result.categories.models.push(filename);
      } else if (lowerPath.includes('/routes/') || filename.includes('route')) {
        result.categories.routes.push(filename);
      } else if (lowerPath.includes('/components/') || filename.includes('component')) {
        result.categories.components.push(filename);
      } else if (lowerPath.includes('/pages/') || filename.includes('page')) {
        result.categories.pages.push(filename);
      } else if (lowerPath.includes('/services/') || filename.includes('service')) {
        result.categories.services.push(filename);
      } else if (lowerPath.includes('/utils/') || lowerPath.includes('/helpers/')) {
        result.categories.utilities.push(filename);
      }

      // Extract snippets of key source code files (e.g. up to 5 files, capped at 1500 chars each)
      const isCodeFile = ['js', 'jsx', 'ts', 'tsx', 'py', 'go', 'java', 'cpp', 'html', 'css'].includes(fileExt.toLowerCase());
      const isNotMeta = !lowerPath.includes('node_modules') && 
                        !lowerPath.includes('package-lock.json') && 
                        !lowerPath.includes('dist') && 
                        !lowerPath.includes('build') && 
                        !lowerPath.includes('.git') &&
                        filename.toLowerCase() !== 'readme.md' &&
                        filename.toLowerCase() !== 'package.json';

      if (isCodeFile && isNotMeta && result.fileSnippets.length < 5) {
        try {
          const fileContent = entry.getData().toString('utf8');
          if (fileContent.trim()) {
            result.fileSnippets.push({
              path,
              content: fileContent.slice(0, 1500)
            });
          }
        } catch (err) {
          console.warn('[ZIP Extract] Failed to read file content for snippet:', path, err.message);
        }
      }

      // Count source code files and code lines (detecting js, jsx, ts, tsx, py, java, cpp, c, php)
      const isSourceCodeExtension = ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'php'].includes(fileExt.toLowerCase());
      if (isSourceCodeExtension && isNotMeta) {
        try {
          const fileContent = entry.getData().toString('utf8');
          const lines = fileContent.split('\n').length;
          result.codeLineCount = (result.codeLineCount || 0) + lines;
          result.codeFilesCount = (result.codeFilesCount || 0) + 1;
        } catch (err) {
          // ignore error reading raw contents
        }
      }
    }

    if (!result.codeFilesCount || result.codeFilesCount === 0) {
      throw new Error('Evaluation Failed. No source code detected.');
    }

    // Limit folder structure list to avoid token inflation
    result.folderStructure = treeList.slice(0, 150);
    if (treeList.length > 150) {
      result.folderStructure.push(`... and ${treeList.length - 150} more files`);
    }

    return result;
  } catch (error) {
    console.error('[ZIP Extract] Failed to process ZIP archive:', error);
    throw error;
  }
};
