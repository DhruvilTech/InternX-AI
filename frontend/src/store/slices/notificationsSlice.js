import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import * as notificationsApi from '../../api/notificationsApi.js';

// Entity adapter for normalized, ordered notifications (latest first)
export const notificationsAdapter = createEntityAdapter({
  selectId: (n) => n._id,
  sortComparer: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
});

// Async Thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async ({ page = 1, limit = 20, append = false } = {}, { rejectWithValue }) => {
    try {
      const response = await notificationsApi.getNotifications(page, limit);
      // Expected backend response structure: { success: true, message: "...", data: { notifications: [], unreadCount: Number, pagination: {...} } }
      const data = response.data;
      return {
        notifications: data.notifications,
        unreadCount: data.unreadCount,
        pagination: data.pagination,
        append,
      };
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
      return { id, notification: response.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to mark notification as read.');
    }
  }
);

export const readAllNotifications = createAsyncThunk(
  'notifications/readAll',
  async (_, { rejectWithValue }) => {
    try {
      await notificationsApi.readAllNotifications();
      return {};
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to mark all as read.');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (id, { rejectWithValue }) => {
    try {
      await notificationsApi.deleteNotification(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete notification.');
    }
  }
);

const initialState = notificationsAdapter.getInitialState({
  unreadCount: 0,
  page: 1,
  totalPages: 1,
  total: 0,
  loading: false,
  error: null,
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotificationsError(state) {
      state.error = null;
    },
    resetNotificationsState(state) {
      notificationsAdapter.removeAll(state);
      state.unreadCount = 0;
      state.page = 1;
      state.totalPages = 1;
      state.total = 0;
      state.loading = false;
      state.error = null;
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
        const { notifications, unreadCount, pagination, append } = action.payload;
        
        if (append) {
          notificationsAdapter.upsertMany(state, notifications);
        } else {
          notificationsAdapter.setAll(state, notifications);
        }

        state.unreadCount = unreadCount;
        if (pagination) {
          state.page = pagination.page;
          state.totalPages = pagination.totalPages;
          state.total = pagination.total;
        }
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Read Notification
      .addCase(readNotification.fulfilled, (state, action) => {
        const { id, notification } = action.payload;
        const existing = state.entities[id];
        if (existing) {
          if (!existing.isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          notificationsAdapter.updateOne(state, {
            id,
            changes: { isRead: true },
          });
        }
      })

      // Read All Notifications
      .addCase(readAllNotifications.fulfilled, (state) => {
        state.unreadCount = 0;
        const updates = state.ids.map((id) => ({
          id,
          changes: { isRead: true },
        }));
        notificationsAdapter.updateMany(state, updates);
      })

      // Delete Notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const id = action.payload;
        const existing = state.entities[id];
        if (existing) {
          if (!existing.isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          notificationsAdapter.removeOne(state, id);
        }
      });
  },
});

export const { clearNotificationsError, resetNotificationsState } = notificationsSlice.actions;

// Selectors
export const {
  selectAll: selectAllNotifications,
  selectById: selectNotificationById,
  selectIds: selectNotificationIds,
} = notificationsAdapter.getSelectors((state) => state.notifications);

export default notificationsSlice.reducer;
