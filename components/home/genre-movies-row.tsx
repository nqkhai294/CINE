"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Spinner } from "@heroui/spinner";
import { Movie } from "@/types";
import { getTopMoviesByGenre } from "@/api/api";
import { MoviePosterCard } from "@/components/home/movie-poster-card";

type FetchGenreMovies = (genreId: string, limit: number) => Promise<Movie[]>;

export type GenreMoviesRowProps = {
  genreId: string;
  genreName: string;
  /** Default: 10 */
  limit?: number;
  /** Link "Xem tất cả". Default: `/genre/${genreId}` */
  viewAllHref?: string;
  /** Override fetch logic (để dùng API "top 10 theo genre" của bạn). */
  fetchMovies?: FetchGenreMovies;
  className?: string;
};

const defaultFetchMovies: FetchGenreMovies = async (genreId, limit) => {
  return await getTopMoviesByGenre(genreId, limit);
};

const VISIBLE_COUNT = 5;

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
  const [startIndex, setStartIndex] = useState(0);

  const resolvedViewAllHref = useMemo(
    () => viewAllHref ?? `/genre/${genreId}`,
    [viewAllHref, genreId],
  );

  useEffect(() => {
    // reset carousel khi đổi thể loại
    setStartIndex(0);
    let cancelled = false;
    setLoading(true);
    setError("");

    fetchMovies(genreId, limit)
      .then((data) => {
        if (!cancelled) setMovies(data ?? []);
      })
      .catch((err: any) => {
        if (!cancelled) setError(err?.message || "Không thể tải danh sách phim");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [genreId, limit, fetchMovies]);

  const visibleMovies = movies.slice(startIndex, startIndex + VISIBLE_COUNT);
  const canPrev = startIndex > 0;
  const canNext = startIndex + VISIBLE_COUNT < movies.length;

  return (
    <section
      className={[
        "w-full py-8 sm:py-10 md:py-12 px-4 sm:px-6 md:px-12 lg:px-16 bg-[#0a0e17] border-b border-white/5 last:border-b-0",
        className ?? "",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
          {genreName}
        </h2>
        <Link
          href={resolvedViewAllHref}
          className="text-sm text-yellow-500 hover:text-yellow-400 font-semibold whitespace-nowrap"
        >
          Xem tất cả →
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[160px]">
          <Spinner size="lg" color="white" />
        </div>
      ) : error ? (
        <div className="text-gray-300 text-sm">{error}</div>
      ) : movies.length === 0 ? (
        <div className="text-gray-400 text-sm">Chưa có phim cho thể loại này.</div>
      ) : (
        <div className="relative pb-2">
          {/* Nút trái */}
          {canPrev && (
            <button
              type="button"
              className="hidden sm:flex items-center justify-center absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white"
              onClick={() =>
                setStartIndex((prev) => Math.max(0, prev - VISIBLE_COUNT))
              }
            >
              ‹
            </button>
          )}

          {/* Nút phải */}
          {canNext && (
            <button
              type="button"
              className="hidden sm:flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white"
              onClick={() =>
                setStartIndex((prev) =>
                  Math.min(movies.length - VISIBLE_COUNT, prev + VISIBLE_COUNT),
                )
              }
            >
              ›
            </button>
          )}

          <div className="flex gap-3 sm:gap-4 overflow-hidden px-1 sm:px-6">
            {visibleMovies.map((movie) => (
              <MoviePosterCard
                key={movie.id}
                movie={movie}
                className="w-[140px] sm:w-[160px] md:w-[180px]"
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

