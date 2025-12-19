import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { setAuthToken, setLoggingOut } from "@/api/api";

interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: any; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;

      // Lưu token và user vào localStorage
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));

      // Set token vào axios header
      setAuthToken(action.payload.token);
    },

    logout: (state) => {
      // Set flag để tránh interceptor hiện toast khi logout chủ động
      setLoggingOut(true);

      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      // Xóa token và user khỏi localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Xóa token khỏi axios header
      setAuthToken(null);

      // Reset flag sau 500ms để cho phép interceptor hoạt động lại
      setTimeout(() => setLoggingOut(false), 500);
    },

    // Load user when refresh page
    loadUser: (state, action: PayloadAction<{ user: any; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;

      // Set token vào axios header khi load user từ localStorage
      setAuthToken(action.payload.token);
    },
  },
});

export const { login, logout, loadUser } = authSlice.actions;

export default authSlice.reducer;
