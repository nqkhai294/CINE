"use client";

import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setFavouritesList, setLoading } from "@/store/slices/favouritesSlice";
import { getFavouritesList } from "@/api/api";

/**
 * Component để load favourites khi user đăng nhập
 * Đặt trong layout để tự động load
 */
export default function FavouritesLoader() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { movieIds } = useAppSelector((state) => state.favourites);

  useEffect(() => {
    const loadFavourites = async () => {
      if (!isAuthenticated) {
        // Clear favourites nếu user đăng xuất
        dispatch(setFavouritesList([]));
        return;
      }

      // CHỈ load khi đã authenticated VÀ favourites chưa có data
      if (movieIds.length === 0) {
        dispatch(setLoading(true));
        try {
          const favourites = await getFavouritesList();
          // API trả về array của movies, extract movieIds
          const ids = favourites.map((item: any) => item.id || item.movie_id);
          dispatch(setFavouritesList(ids));
        } catch (error) {
          console.error("Error loading favourites:", error);
          // Không cần xử lý 401 ở đây, interceptor đã xử lý
        } finally {
          dispatch(setLoading(false));
        }
      }
    };

    loadFavourites();
  }, [isAuthenticated, dispatch]); // Bỏ movieIds.length khỏi deps để tránh loop

  return null; // Component này không render gì
}
