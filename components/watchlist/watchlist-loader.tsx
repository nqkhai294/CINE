"use client";

import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setWatchlist, setLoading } from "@/store/slices/watchlistSlice";
import { getWatchlist } from "@/api/api";

/**
 * Component để load watchlist khi user đăng nhập
 * Đặt trong layout để tự động load
 */
export default function WatchlistLoader() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { movieIds } = useAppSelector((state) => state.watchlist);

  useEffect(() => {
    const loadWatchlist = async () => {
      if (!isAuthenticated) {
        // Clear watchlist nếu user đăng xuất
        dispatch(setWatchlist([]));
        return;
      }

      // Chỉ load nếu watchlist chưa có data
      if (movieIds.length === 0) {
        dispatch(setLoading(true));
        try {
          const watchlist = await getWatchlist();
          // API trả về array của movies, extract movieIds
          const ids = watchlist.map((item: any) => item.id || item.movie_id);
          dispatch(setWatchlist(ids));
        } catch (error) {
          console.error("Error loading watchlist:", error);
        } finally {
          dispatch(setLoading(false));
        }
      }
    };

    loadWatchlist();
  }, [isAuthenticated, dispatch, movieIds.length]);

  return null; // Component này không render gì
}

