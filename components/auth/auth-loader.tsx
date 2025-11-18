"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { loadUser } from "@/store/slices/authSlice";

export const AuthLoader = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Chỉ chạy 1 lần khi component mount
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        // Load user vào Redux
        dispatch(loadUser({ user, token }));
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        // Nếu parse lỗi, xóa localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, [dispatch]);

  // Component này không render gì cả
  return null;
};

