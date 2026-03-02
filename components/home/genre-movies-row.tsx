"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
  const listRef = useRef<HTMLDivElement | null>(null);

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
              className="hidden sm:flex items-center justify-center absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-yellow-500 text-black shadow-lg hover:bg-yellow-400"
              onClick={() => {
                if (!canPrev) return;
                setStartIndex((prev) => Math.max(0, prev - 1));
                const container = listRef.current;
                if (container && container.firstElementChild) {
                  const itemWidth =
                    (container.firstElementChild as HTMLElement).getBoundingClientRect()
                      .width + 16; // +gap approx
                  container.scrollBy({ left: -itemWidth, behavior: "smooth" });
                }
              }}
            >
              ‹
            </button>
          )}

          {/* Nút phải */}
          {canNext && (
            <button
              type="button"
              className="hidden sm:flex items-center justify-center absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-yellow-500 text-black shadow-lg hover:bg-yellow-400"
              onClick={() => {
                if (!canNext) return;
                setStartIndex((prev) =>
                  Math.min(Math.max(movies.length - VISIBLE_COUNT, 0), prev + 1),
                );
                const container = listRef.current;
                if (container && container.firstElementChild) {
                  const itemWidth =
                    (container.firstElementChild as HTMLElement).getBoundingClientRect()
                      .width + 16;
                  container.scrollBy({ left: itemWidth, behavior: "smooth" });
                }
              }}
            >
              ›
            </button>
          )}

          <div
            ref={listRef}
            className="flex gap-3 sm:gap-4 overflow-x-hidden overflow-y-visible px-1 sm:px-6 scroll-smooth"
          >
            {movies.map((movie) => (
              <MoviePosterCard
                key={movie.id}
                movie={movie}
                className="flex-[0_0_20%] max-w-[20%]"
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

