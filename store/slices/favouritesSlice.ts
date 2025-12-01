import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FavouritesState {
  movieIds: (string | number)[];
  isLoading: boolean;
}

const initialState: FavouritesState = {
  movieIds: [],
  isLoading: false,
};

const favouritesSlice = createSlice({
  name: "favourites",
  initialState,
  reducers: {
    setFavouritesList: (state, action: PayloadAction<(string | number)[]>) => {
      state.movieIds = action.payload;
    },
    addToFavouritesList: (state, action: PayloadAction<string | number>) => {
      if (!state.movieIds.includes(action.payload)) {
        state.movieIds.push(action.payload);
      }
    },
    removeFromFavouritesList: (
      state,
      action: PayloadAction<string | number>
    ) => {
      state.movieIds = state.movieIds.filter((id) => id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setFavouritesList,
  addToFavouritesList,
  removeFromFavouritesList,
  setLoading,
} = favouritesSlice.actions;

export default favouritesSlice.reducer;
