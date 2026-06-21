import axios from 'axios';

/**
 * Creates an authenticated Axios instance configured for GitHub API requests.
 * Implements exponential backoff retries on 5xx errors and custom Rate Limit parsing.
 * 
 * @param {string} accessToken Decrypted GitHub access token
 * @returns {AxiosInstance}
 */
export const getGithubClient = (accessToken) => {
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'InternX-AI',
  };

  if (accessToken && accessToken.trim() !== '' && accessToken !== 'undefined' && accessToken !== 'null') {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const client = axios.create({
    baseURL: 'https://api.github.com',
    headers,
    timeout: 15000,
  });

  // Response Interceptor for Rate Limiting & Retry Policy
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const { config, response } = error;

      // 1. Detect GitHub Rate Limit Exceeded
      if (response && response.status === 403) {
        const remaining = response.headers['x-ratelimit-remaining'];
        if (remaining === '0') {
          const resetTime = parseInt(response.headers['x-ratelimit-reset'], 10) * 1000;
          const waitTimeMin = Math.ceil((resetTime - Date.now()) / 60000);
          
          const rateLimitErr = new Error(`GitHub API rate limit exceeded. Please retry in ${waitTimeMin} minute(s).`);
          rateLimitErr.statusCode = 429;
          return Promise.reject(rateLimitErr);
        }
      }

      // 2. Exponential Backoff Retry Policy for Network / 5xx drops
      if (!config) {
        return Promise.reject(error);
      }

      config.retryConfig = config.retryConfig || {
        count: 0,
        maxRetries: 3,
        backoffDelay: 1000,
      };

      const isNetworkOr5xx = !response || (response.status >= 500 && response.status <= 599);
      const underRetryLimit = config.retryConfig.count < config.retryConfig.maxRetries;

      if (isNetworkOr5xx && underRetryLimit) {
        config.retryConfig.count += 1;
        const delay = config.retryConfig.backoffDelay * Math.pow(2, config.retryConfig.count);
        
        console.warn(`[GitHub API] Retrying request (${config.retryConfig.count}/${config.retryConfig.maxRetries}) to ${config.url} in ${delay}ms...`);
        
        await new Promise((resolve) => setTimeout(resolve, delay));
        return client(config);
      }

      // Map common errors to user-friendly messages with status codes
      if (response) {
        if (response.status === 401) {
          const authErr = new Error('GitHub token expired or revoked. Please reconnect your account.');
          authErr.statusCode = 401;
          return Promise.reject(authErr);
        }
        if (response.status === 404) {
          const notFoundErr = new Error('GitHub repository or resource not found.');
          notFoundErr.statusCode = 404;
          return Promise.reject(notFoundErr);
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
};
