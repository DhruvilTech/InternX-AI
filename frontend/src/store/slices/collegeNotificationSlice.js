import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as collegeApi from '../../api/collegeApi.js';

export const fetchCollegeNotifications = createAsyncThunk(
  'collegeNotifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await collegeApi.getCollegeNotifications();
      return response.data; // this is the array of notifications
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch college notifications.');
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'collegeNotifications/markRead',
  async (id, { rejectWithValue }) => {
    try {
      const response = await collegeApi.markCollegeNotificationRead(id);
      return response.data; // this is the updated notification
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to mark notification as read.');
    }
  }
);

const collegeNotificationSlice = createSlice({
  name: 'collegeNotifications',
  initialState: {
    notifications: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearNotificationError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCollegeNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCollegeNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchCollegeNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n._id === action.payload._id);
        if (index !== -1) {
          state.notifications[index] = action.payload;
        }
      });
  },
});

export const { clearNotificationError } = collegeNotificationSlice.actions;
export default collegeNotificationSlice.reducer;
