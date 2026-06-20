import { configureStore } from '@reduxjs/toolkit';
import githubReducer from './slices/githubSlice.js';

export const store = configureStore({
  reducer: {
    github: githubReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Prevents errors from Date objects in states
    }),
});

export default store;
