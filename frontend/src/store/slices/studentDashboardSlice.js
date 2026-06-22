import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios.js';

export const fetchStudentDashboard = createAsyncThunk(
  'studentDashboard/fetch',
  async (force = false, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/student/dashboard');
      // Response shape: { success: true, message: '...', data: { studentCareer, internship, tasks, connectedRepo, evaluationReport } }
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load student dashboard metrics.');
    }
  },
  {
    condition: (force, { getState }) => {
      const { studentDashboard } = getState();
      if (studentDashboard.loading) return false;
      
      // Skip fetch if we already have data and it's less than 30s old, unless forced refresh
      if (!force && studentDashboard.data && studentDashboard.lastFetched) {
        const age = Date.now() - studentDashboard.lastFetched;
        if (age < 30000) {
          return false; // Return false to cancel execution of the thunk payload creator
        }
      }
      return true;
    }
  }
);

const initialState = {
  data: null,
  loading: false,
  error: null,
  lastFetched: null,
};

const studentDashboardSlice = createSlice({
  name: 'studentDashboard',
  initialState,
  reducers: {
    clearStudentDashboardError(state) {
      state.error = null;
    },
    resetStudentDashboardState(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchStudentDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearStudentDashboardError, resetStudentDashboardState } = studentDashboardSlice.actions;
export default studentDashboardSlice.reducer;
