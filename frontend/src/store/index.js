import { configureStore } from '@reduxjs/toolkit';
import githubReducer from './slices/githubSlice.js';
import collegeReducer from './slices/collegeSlice.js';

export const store = configureStore({
  reducer: {
    github: githubReducer,
    college: collegeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Prevents errors from Date objects in states
    }),
});

export default store;
