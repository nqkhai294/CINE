import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import watchlistReducer from "./slices/watchlistSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    watchlist: watchlistReducer,
  },
});

// Export types để dùng TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
