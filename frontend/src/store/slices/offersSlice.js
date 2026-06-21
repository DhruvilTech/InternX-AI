import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as offersApi from '../../api/offersApi.js';

// Thunks
export const createOffer = createAsyncThunk(
  'offers/create',
  async (offerData, { rejectWithValue }) => {
    try {
      const response = await offersApi.createOffer(offerData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to send internship offer.');
    }
  }
);

export const getSentOffers = createAsyncThunk(
  'offers/getSent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await offersApi.getSentOffers();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to retrieve sent offers.');
    }
  }
);

export const getReceivedOffers = createAsyncThunk(
  'offers/getReceived',
  async (_, { rejectWithValue }) => {
    try {
      const response = await offersApi.getReceivedOffers();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to retrieve received offers.');
    }
  }
);

export const respondToOffer = createAsyncThunk(
  'offers/respond',
  async ({ offerId, status }, { rejectWithValue }) => {
    try {
      const response = await offersApi.respondToOffer(offerId, { status });
      return { offerId, status, data: response.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to respond to internship offer.');
    }
  }
);

const initialState = {
  sentOffers: [],
  receivedOffers: [],
  loading: false,
  error: null,
};

const offersSlice = createSlice({
  name: 'offers',
  initialState,
  reducers: {
    clearOffersError(state) {
      state.error = null;
    },
    resetOffersState(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Offer
      .addCase(createOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOffer.fulfilled, (state, action) => {
        state.loading = false;
        state.sentOffers.unshift(action.payload);
      })
      .addCase(createOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Sent Offers
      .addCase(getSentOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSentOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.sentOffers = action.payload;
      })
      .addCase(getSentOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Received Offers
      .addCase(getReceivedOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getReceivedOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.receivedOffers = action.payload;
      })
      .addCase(getReceivedOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Respond to Offer
      .addCase(respondToOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(respondToOffer.fulfilled, (state, action) => {
        state.loading = false;
        const { offerId, status } = action.payload;
        state.receivedOffers = state.receivedOffers.map((o) =>
          o._id === offerId ? { ...o, status } : o
        );
      })
      .addCase(respondToOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOffersError, resetOffersState } = offersSlice.actions;
export default offersSlice.reducer;
