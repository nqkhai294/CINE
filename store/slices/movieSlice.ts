import { Movie } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MovieState {
  currentMovie: Movie | null;
}

const initialState: MovieState = {
  currentMovie: null,
};

const movieSlice = createSlice({
  name: "movie",
  initialState,
  reducers: {
    setCurrentMovie: (state, action: PayloadAction<Movie | null>) => {
      state.currentMovie = action.payload;
    },
    clearCurrentMovie: (state) => {
      state.currentMovie = null;
    },
  },
});

export const { setCurrentMovie, clearCurrentMovie } = movieSlice.actions;

export default movieSlice.reducer;
