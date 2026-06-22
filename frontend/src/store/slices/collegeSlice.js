import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as collegeApi from '../../api/collegeApi.js';

// Thunks
export const fetchCollegeProfile = createAsyncThunk(
  'college/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await collegeApi.getProfile();
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch college profile.');
    }
  }
);

export const updateCollegeProfile = createAsyncThunk(
  'college/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await collegeApi.updateProfile(profileData);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update college profile.');
    }
  }
);

export const getDashboard = createAsyncThunk(
  'college/getDashboard',
  async (force = false, { rejectWithValue }) => {
    try {
      const response = await collegeApi.getDashboard();
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load dashboard metrics.');
    }
  },
  {
    condition: (force, { getState }) => {
      const { college } = getState();
      if (college.loading) return false;
      if (!force && college.dashboard && college.lastFetchedDashboard) {
        const age = Date.now() - college.lastFetchedDashboard;
        if (age < 30000) return false;
      }
      return true;
    },
  }
);

export const getStudents = createAsyncThunk(
  'college/getStudents',
  async (params, { rejectWithValue }) => {
    try {
      const response = await collegeApi.getStudents(params);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load students cohort.');
    }
  }
);

export const getStudentDetails = createAsyncThunk(
  'college/getStudentDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await collegeApi.getStudentDetails(id);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch student details.');
    }
  }
);

export const getInternships = createAsyncThunk(
  'college/getInternships',
  async (_, { rejectWithValue }) => {
    try {
      const response = await collegeApi.getInternships();
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load internship analytics.');
    }
  },
  {
    condition: (_, { getState }) => {
      const { college } = getState();
      if (college.loading) return false;
      return true;
    },
  }
);

export const getPlacementAnalytics = createAsyncThunk(
  'college/getPlacementAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await collegeApi.getPlacementReadiness();
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load placement analytics.');
    }
  },
  {
    condition: (_, { getState }) => {
      const { college } = getState();
      if (college.loading) return false;
      return true;
    },
  }
);

export const getSkillAnalytics = createAsyncThunk(
  'college/getSkillAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await collegeApi.getSkills();
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load skill analytics.');
    }
  },
  {
    condition: (_, { getState }) => {
      const { college } = getState();
      if (college.loading) return false;
      return true;
    },
  }
);

export const getCertificates = createAsyncThunk(
  'college/getCertificates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await collegeApi.getCertificates();
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load certificates log.');
    }
  },
  {
    condition: (_, { getState }) => {
      const { college } = getState();
      if (college.loading) return false;
      return true;
    },
  }
);

export const getReports = createAsyncThunk(
  'college/getReports',
  async (type, { rejectWithValue }) => {
    try {
      const response = await collegeApi.getReports(type);
      return { type, data: response };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to compile report.');
    }
  }
);

export const addDepartment = createAsyncThunk(
  'college/addDepartment',
  async (deptData, { rejectWithValue }) => {
    try {
      const response = await collegeApi.createDepartment(deptData);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create department.');
    }
  }
);

// Initial State
const initialState = {
  profile: null,
  dashboard: null,
  students: [],
  pagination: null,
  selectedStudent: null,
  analytics: null,
  skills: null,
  placement: null,
  certificates: [],
  reports: {},
  loading: false,
  error: null,
};

// Slice Configuration
const collegeSlice = createSlice({
  name: 'college',
  initialState,
  reducers: {
    clearCollegeError(state) {
      state.error = null;
    },
    resetCollegeState(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      // Profile Cases
      .addCase(fetchCollegeProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCollegeProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchCollegeProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Profile Cases
      .addCase(updateCollegeProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      })

      // Dashboard Cases
      .addCase(getDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
        state.lastFetchedDashboard = Date.now();
      })
      .addCase(getDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Students Cases
      .addCase(getStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload.students;
        state.pagination = action.payload.pagination;
      })
      .addCase(getStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Student Details Cases
      .addCase(getStudentDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedStudent = null;
      })
      .addCase(getStudentDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedStudent = action.payload;
      })
      .addCase(getStudentDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Internship Analytics Cases
      .addCase(getInternships.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getInternships.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(getInternships.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Placement Analytics Cases
      .addCase(getPlacementAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPlacementAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.placement = action.payload;
      })
      .addCase(getPlacementAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Skill Analytics Cases
      .addCase(getSkillAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSkillAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.skills = action.payload;
      })
      .addCase(getSkillAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Certificates Cases
      .addCase(getCertificates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCertificates.fulfilled, (state, action) => {
        state.loading = false;
        state.certificates = action.payload.certificates;
      })
      .addCase(getCertificates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Reports Cases
      .addCase(getReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports[action.payload.type] = action.payload.data;
      })
      .addCase(getReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Department Cases
      .addCase(addDepartment.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.departments.push(action.payload);
        }
      });
  },
});

export const { clearCollegeError, resetCollegeState } = collegeSlice.actions;
export default collegeSlice.reducer;
