import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WatchlistState {
  movieIds: (string | number)[];
  isLoading: boolean;
}

const initialState: WatchlistState = {
  movieIds: [],
  isLoading: false,
};

const watchlistSlice = createSlice({
  name: "watchlist",
  initialState,
  reducers: {
    setWatchlist: (state, action: PayloadAction<(string | number)[]>) => {
      state.movieIds = action.payload;
    },
    addToWatchlist: (state, action: PayloadAction<string | number>) => {
      if (!state.movieIds.includes(action.payload)) {
        state.movieIds.push(action.payload);
      }
    },
    removeFromWatchlist: (state, action: PayloadAction<string | number>) => {
      state.movieIds = state.movieIds.filter(
        (id) => id !== action.payload
      );
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  setLoading,
} = watchlistSlice.actions;

export default watchlistSlice.reducer;

