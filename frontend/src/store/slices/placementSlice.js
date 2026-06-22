import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as collegeApi from '../../api/collegeApi.js';

export const fetchPlacements = createAsyncThunk(
  'placement/fetchPlacements',
  async (params, { rejectWithValue }) => {
    try {
      const response = await collegeApi.getPlacements(params);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch placements.');
    }
  }
);

const placementSlice = createSlice({
  name: 'placement',
  initialState: {
    placements: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
    loading: false,
    error: null,
  },
  reducers: {
    clearPlacementError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlacements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlacements.fulfilled, (state, action) => {
        state.loading = false;
        state.placements = action.payload.placements;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPlacements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPlacementError } = placementSlice.actions;
export default placementSlice.reducer;
