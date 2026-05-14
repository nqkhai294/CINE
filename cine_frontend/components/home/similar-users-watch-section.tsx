"use client";

import React, { useEffect, useState } from "react";
import { getSimilarUsersWatchRecommendations } from "@/api/api";
import { useAppSelector } from "@/store/hooks";
import { HorizontalMovieRow } from "@/components/browse/horizontal-movie-row";
import type { Movie } from "@/types";

export function SimilarUsersWatchSection() {
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setMovies([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getSimilarUsersWatchRecommendations()
      .then((list) => {
        if (cancelled) return;
        setMovies(list && list.length > 0 ? list : []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;
  if (loading) return null;
  if (movies.length === 0) return null;

  return (
    <HorizontalMovieRow
      listKey="similar-users-watch"
      title="Những người dùng giống bạn cũng xem"
      subtitle="Gợi ý từ lọc cộng tác (CF) trên đánh giá trong hệ thống."
      movies={movies}
      loading={false}
      viewAllHref="/movies"
      viewAllLabel="Tất cả phim →"
    />
  );
}
