"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Movie } from "@/types";
import { getTopMoviesByGenre } from "@/api/api";
import { HorizontalMovieRow } from "@/components/browse/horizontal-movie-row";

type FetchGenreMovies = (genreId: string, limit: number) => Promise<Movie[]>;

export type GenreMoviesRowProps = {
  genreId: string;
  genreName: string;
  limit?: number;
  viewAllHref?: string;
  fetchMovies?: FetchGenreMovies;
  className?: string;
};

const defaultFetchMovies: FetchGenreMovies = async (genreId, limit) => {
  return await getTopMoviesByGenre(genreId, limit);
};

export function GenreMoviesRow({
  genreId,
  genreName,
  limit = 10,
  viewAllHref,
  fetchMovies = defaultFetchMovies,
  className,
}: GenreMoviesRowProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const resolvedViewAllHref = useMemo(
    () => viewAllHref ?? `/genre/${genreId}`,
    [viewAllHref, genreId],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    fetchMovies(genreId, limit)
      .then((data) => {
        if (!cancelled) setMovies(data ?? []);
      })
      .catch((err: any) => {
        if (!cancelled)
          setError(err?.message || "Không thể tải danh sách phim");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [genreId, limit, fetchMovies]);

  return (
    <HorizontalMovieRow
      listKey={genreId}
      title={genreName}
      movies={movies}
      loading={loading}
      error={error || undefined}
      emptyMessage="Chưa có phim cho thể loại này."
      viewAllHref={resolvedViewAllHref}
      className={className}
    />
  );
}
