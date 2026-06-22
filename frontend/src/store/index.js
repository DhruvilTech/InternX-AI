import { configureStore } from '@reduxjs/toolkit';
import githubReducer from './slices/githubSlice.js';
import collegeReducer from './slices/collegeSlice.js';
import recruiterReducer from './slices/recruiterSlice.js';
import offersReducer from './slices/offersSlice.js';
import notificationsReducer from './slices/notificationsSlice.js';
import placementReducer from './slices/placementSlice.js';
import studentDashboardReducer from './slices/studentDashboardSlice.js';

export const store = configureStore({
  reducer: {
    github: githubReducer,
    college: collegeReducer,
    recruiter: recruiterReducer,
    offers: offersReducer,
    notifications: notificationsReducer,
    placement: placementReducer,
    studentDashboard: studentDashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Prevents errors from Date objects in states
    }),
});

export default store;
