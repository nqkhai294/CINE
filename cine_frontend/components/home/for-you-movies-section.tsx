"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getForYouRecommendations, type ForYouMeta } from "@/api/api";
import { useAppSelector } from "@/store/hooks";
import { HorizontalMovieRow } from "@/components/browse/horizontal-movie-row";
import type { Movie } from "@/types";

function forYouSubtitle(meta: ForYouMeta | null): string | undefined {
  if (!meta) return undefined;
  if (meta.blend === "fallback_no_ratings") {
    return "Phim xu hướng và mới nhất. Hãy chấm vài phim để nhận gợi ý cá nhân hóa.";
  }

  if (meta.source === "content-based") {
    return "Gợi ý theo nội dung phim bạn đã đánh giá. ";
  }
  return undefined;
}

export function ForYouMoviesSection() {
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [meta, setMeta] = useState<ForYouMeta | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setMovies([]);
      setMeta(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getForYouRecommendations()
      .then((res) => {
        if (cancelled) return;
        if (res) {
          setMovies(res.data);
          setMeta(res.meta);
        } else {
          setMovies([]);
          setMeta(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const subtitle = useMemo(() => forYouSubtitle(meta), [meta]);

  if (!isAuthenticated) return null;
  if (!loading && movies.length === 0) return null;

  return (
    <HorizontalMovieRow
      listKey="for-you"
      title="Phim gợi ý cho bạn"
      subtitle={subtitle}
      movies={movies}
      loading={loading}
      viewAllHref="/movies"
      viewAllLabel="Tất cả phim →"
    />
  );
}
