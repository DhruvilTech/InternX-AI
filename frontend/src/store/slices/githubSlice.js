import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as githubApi from '../../api/githubApi.js';

// Asynchronous Thunks
export const connectGithub = createAsyncThunk(
  'github/connectGithub',
  async (token, { rejectWithValue }) => {
    try {
      // Direct user redirect to initiate the OAuth flow
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      window.location.href = `${baseUrl}/api/github/connect?token=${token}`;
      return true;
    } catch (err) {
      return rejectWithValue('Failed to redirect to GitHub authorization page.');
    }
  }
);

export const getGithubProfile = createAsyncThunk(
  'github/getGithubProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await githubApi.getProfile();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'GitHub profile not found.');
    }
  }
);

export const getRepositories = createAsyncThunk(
  'github/getRepositories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await githubApi.getRepositories();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to sync repositories.');
    }
  }
);

export const getRepositoryDetails = createAsyncThunk(
  'github/getRepositoryDetails',
  async (repoId, { rejectWithValue }) => {
    try {
      // Parallel requests to compile detailed statistics
      const [repoRes, langRes, commitRes, prRes] = await Promise.all([
        githubApi.getRepositoryDetails(repoId),
        githubApi.getRepositoryLanguages(repoId),
        githubApi.getRepositoryCommits(repoId),
        githubApi.getRepositoryPRs(repoId),
      ]);

      return {
        metadata: repoRes.data,
        languages: langRes.data,
        commits: commitRes.data,
        pullRequests: prRes.data,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load repository details.');
    }
  }
);

export const selectRepository = createAsyncThunk(
  'github/selectRepository',
  async (repoData, { rejectWithValue }) => {
    try {
      const response = await githubApi.selectRepository(repoData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to select repository.');
    }
  }
);

export const getSelectedRepository = createAsyncThunk(
  'github/getSelectedRepository',
  async (_, { rejectWithValue }) => {
    try {
      const response = await githubApi.getSelectedRepository();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch active repository selection.');
    }
  }
);

export const disconnectGithub = createAsyncThunk(
  'github/disconnectGithub',
  async (_, { rejectWithValue }) => {
    try {
      const response = await githubApi.disconnectGithub();
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to disconnect GitHub integration.');
    }
  }
);

// Initial State
const initialState = {
  profile: null,
  repositories: [],
  selectedRepository: null,
  activeRepoDetails: null, // Holds parallel loaded metadata + analytics
  loading: false,
  error: null,
};

// Slice Configuration
const githubSlice = createSlice({
  name: 'github',
  initialState,
  reducers: {
    clearGithubError(state) {
      state.error = null;
    },
    resetGithubState(state) {
      state.profile = null;
      state.repositories = [];
      state.selectedRepository = null;
      state.activeRepoDetails = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // connectGithub
      .addCase(connectGithub.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(connectGithub.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getGithubProfile
      .addCase(getGithubProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGithubProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(getGithubProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.profile = null; // Reset profile if not connected
      })

      // getRepositories
      .addCase(getRepositories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRepositories.fulfilled, (state, action) => {
        state.loading = false;
        state.repositories = action.payload;
      })
      .addCase(getRepositories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getRepositoryDetails
      .addCase(getRepositoryDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.activeRepoDetails = null;
      })
      .addCase(getRepositoryDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.activeRepoDetails = action.payload;
      })
      .addCase(getRepositoryDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // selectRepository
      .addCase(selectRepository.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(selectRepository.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRepository = action.payload;
      })
      .addCase(selectRepository.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getSelectedRepository
      .addCase(getSelectedRepository.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSelectedRepository.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRepository = action.payload;
      })
      .addCase(getSelectedRepository.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // disconnectGithub
      .addCase(disconnectGithub.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(disconnectGithub.fulfilled, (state) => {
        state.loading = false;
        state.profile = null;
        state.repositories = [];
        state.selectedRepository = null;
        state.activeRepoDetails = null;
        state.error = null;
      })
      .addCase(disconnectGithub.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearGithubError, resetGithubState } = githubSlice.actions;
export default githubSlice.reducer;
