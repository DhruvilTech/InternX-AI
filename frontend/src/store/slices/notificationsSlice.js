import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as notificationsApi from '../../api/notificationsApi.js';

// Thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationsApi.getNotifications();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch notifications.');
    }
  }
);

export const readNotification = createAsyncThunk(
  'notifications/read',
  async (id, { rejectWithValue }) => {
    try {
      const response = await notificationsApi.readNotification(id);
      return { id, data: response.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to mark notification as read.');
    }
  }
);

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotificationsError(state) {
      state.error = null;
    },
    resetNotificationsState(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Read Notification
      .addCase(readNotification.fulfilled, (state, action) => {
        const { id } = action.payload;
        state.notifications = state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        );
        state.unreadCount = state.notifications.filter((n) => !n.isRead).length;
      });
  },
});

export const { clearNotificationsError, resetNotificationsState } = notificationsSlice.actions;
export default notificationsSlice.reducer;
