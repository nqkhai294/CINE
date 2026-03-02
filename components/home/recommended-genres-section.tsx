"use client";

import React, { useEffect, useState } from "react";
import { getRecommendedGenres, type RecommendedGenre } from "@/api/api";
import { useAppSelector } from "@/store/hooks";
import { GenreMoviesRow } from "@/components/home/genre-movies-row";

export function RecommendedGenresSection({
  maxGenres = 8,
}: {
  maxGenres?: number;
}) {
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const [genres, setGenres] = useState<RecommendedGenre[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setGenres([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    getRecommendedGenres()
      .then((data) => {
        if (!cancelled) setGenres((data ?? []).slice(0, maxGenres));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, maxGenres]);

  // Chỉ hiện khi đã đăng nhập (vì API cần auth).
  if (!isAuthenticated) return null;

  // Có thể để loading nhẹ, nhưng GenreMoviesRow cũng có loading riêng.
  if (!loading && genres.length === 0) return null;

  return (
    <>
      {genres.map((g) => (
        <GenreMoviesRow
          key={g.genre_id}
          genreId={g.genre_id}
          genreName={g.genre_name}
        />
      ))}
    </>
  );
}

