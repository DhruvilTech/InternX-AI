import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as recruiterApi from '../../api/recruiterApi.js';

// Thunks
export const fetchRecruiterProfile = createAsyncThunk(
  'recruiter/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await recruiterApi.getProfile();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch recruiter profile.');
    }
  }
);

export const updateRecruiterProfile = createAsyncThunk(
  'recruiter/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await recruiterApi.updateProfile(profileData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update recruiter profile.');
    }
  }
);

export const getRecruiterDashboard = createAsyncThunk(
  'recruiter/getDashboard',
  async (force = false, { rejectWithValue }) => {
    try {
      const response = await recruiterApi.getDashboard();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load dashboard metrics.');
    }
  },
  {
    // Skip if already loading or data is fresh (< 30s old)
    condition: (force, { getState }) => {
      const { recruiter } = getState();
      if (recruiter.loading) return false;
      if (!force && recruiter.dashboard && recruiter.lastFetchedDashboard) {
        const age = Date.now() - recruiter.lastFetchedDashboard;
        if (age < 30000) return false;
      }
      return true;
    },
  }
);

export const getRecruiterStudents = createAsyncThunk(
  'recruiter/getStudents',
  async (params, { rejectWithValue }) => {
    try {
      const response = await recruiterApi.getStudents(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to search candidate pool.');
    }
  }
);

export const getRecruiterStudentDetails = createAsyncThunk(
  'recruiter/getStudentDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await recruiterApi.getStudentDetails(id);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load student details.');
    }
  }
);

export const getRecruiterShortlisted = createAsyncThunk(
  'recruiter/getShortlisted',
  async (_, { rejectWithValue }) => {
    try {
      const response = await recruiterApi.getShortlisted();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load corporate shortlist.');
    }
  },
  {
    condition: (_, { getState }) => {
      const { recruiter } = getState();
      if (recruiter.loading) return false;
      return true;
    },
  }
);

export const toggleRecruiterShortlist = createAsyncThunk(
  'recruiter/toggleShortlist',
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await recruiterApi.toggleShortlist(studentId);
      return { studentId, data: response.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to toggle candidate shortlist.');
    }
  }
);

export const getRecruiterPipeline = createAsyncThunk(
  'recruiter/getPipeline',
  async (_, { rejectWithValue }) => {
    try {
      const response = await recruiterApi.getPipeline();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load recruitment pipeline.');
    }
  },
  {
    condition: (_, { getState }) => {
      const { recruiter } = getState();
      if (recruiter.loading) return false;
      return true;
    },
  }
);

export const updateRecruiterPipelineStage = createAsyncThunk(
  'recruiter/updatePipeline',
  async ({ studentId, stage, notes }, { rejectWithValue }) => {
    try {
      const response = await recruiterApi.updatePipelineStage(studentId, { stage, notes });
      return { studentId, stage, notes, data: response.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update candidate pipeline stage.');
    }
  }
);

export const deleteRecruiterFromPipeline = createAsyncThunk(
  'recruiter/deleteFromPipeline',
  async (studentId, { rejectWithValue }) => {
    try {
      await recruiterApi.deleteFromPipeline(studentId);
      return studentId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to remove candidate from pipeline.');
    }
  }
);

export const getRecruiterContactRequests = createAsyncThunk(
  'recruiter/getContactRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await recruiterApi.getContactRequests();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load contact requests logs.');
    }
  }
);

export const createRecruiterContactRequest = createAsyncThunk(
  'recruiter/createContactRequest',
  async (outreachData, { rejectWithValue }) => {
    try {
      const response = await recruiterApi.createContactRequest(outreachData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to send outreach message.');
    }
  }
);

export const getRecruiterAnalytics = createAsyncThunk(
  'recruiter/getAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await recruiterApi.getAnalytics();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to compile recruiter analytics.');
    }
  },
  {
    condition: (_, { getState }) => {
      const { recruiter } = getState();
      if (recruiter.loading) return false;
      return true;
    },
  }
);

// Initial state
const initialState = {
  profile: null,
  dashboard: null,
  students: [],
  pagination: null,
  studentDetails: null,
  shortlisted: [],
  pipeline: [],
  contactRequests: [],
  analytics: null,
  loading: false,
  error: null,
};

// Slice Configuration
const recruiterSlice = createSlice({
  name: 'recruiter',
  initialState,
  reducers: {
    clearRecruiterError(state) {
      state.error = null;
    },
    resetRecruiterState(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      // Profile Cases
      .addCase(fetchRecruiterProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecruiterProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchRecruiterProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateRecruiterProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      })

      // Dashboard Cases
      .addCase(getRecruiterDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRecruiterDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
        state.lastFetchedDashboard = Date.now();
      })
      .addCase(getRecruiterDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Students Cases
      .addCase(getRecruiterStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRecruiterStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload.students;
        state.pagination = action.payload.pagination;
      })
      .addCase(getRecruiterStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Student Details Cases
      .addCase(getRecruiterStudentDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.studentDetails = null;
      })
      .addCase(getRecruiterStudentDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.studentDetails = action.payload;
      })
      .addCase(getRecruiterStudentDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Shortlist Cases
      .addCase(getRecruiterShortlisted.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRecruiterShortlisted.fulfilled, (state, action) => {
        state.loading = false;
        state.shortlisted = action.payload;
      })
      .addCase(getRecruiterShortlisted.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleRecruiterShortlist.fulfilled, (state, action) => {
        const { studentId, data } = action.payload;
        const isShortlisted = data.isShortlisted;

        // Toggle state in discovery list
        state.students = state.students.map(s =>
          s.userId === studentId ? { ...s, isShortlisted } : s
        );

        // Toggle state in details
        if (state.studentDetails && state.studentDetails.studentProfile.userId === studentId) {
          state.studentDetails.studentProfile.isShortlisted = isShortlisted;
        }

        // Add/remove from shortlisted list if loaded
        if (isShortlisted) {
          // Trigger reload or push (safest is to let UI trigger reload, or push a partial)
        } else {
          state.shortlisted = state.shortlisted.filter(s => s.userId !== studentId);
        }
      })

      // Pipeline Cases
      .addCase(getRecruiterPipeline.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRecruiterPipeline.fulfilled, (state, action) => {
        state.loading = false;
        state.pipeline = action.payload;
      })
      .addCase(getRecruiterPipeline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateRecruiterPipelineStage.fulfilled, (state, action) => {
        const { studentId, stage, notes } = action.payload;
        // Update stage locally
        state.pipeline = state.pipeline.map(item =>
          item.userId === studentId ? { ...item, stage, notes, updatedAt: new Date() } : item
        );
        if (state.studentDetails && state.studentDetails.studentProfile.userId === studentId) {
          state.studentDetails.studentProfile.pipelineStage = stage;
          state.studentDetails.studentProfile.pipelineNotes = notes;
        }
      })
      .addCase(deleteRecruiterFromPipeline.fulfilled, (state, action) => {
        const studentId = action.payload;
        state.pipeline = state.pipeline.filter(item => item.userId !== studentId);
        if (state.studentDetails && state.studentDetails.studentProfile.userId === studentId) {
          state.studentDetails.studentProfile.pipelineStage = null;
          state.studentDetails.studentProfile.pipelineNotes = '';
        }
      })

      // Contact Requests Cases
      .addCase(getRecruiterContactRequests.fulfilled, (state, action) => {
        state.contactRequests = action.payload;
      })
      .addCase(createRecruiterContactRequest.fulfilled, (state, action) => {
        state.contactRequests.push(action.payload);
      })

      // Analytics Cases
      .addCase(getRecruiterAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRecruiterAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(getRecruiterAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearRecruiterError, resetRecruiterState } = recruiterSlice.actions;
export default recruiterSlice.reducer;
