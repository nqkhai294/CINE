"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Spinner } from "@heroui/spinner";
import { Movie } from "@/types";
import { MoviePosterCard } from "@/components/browse/movie-poster-card";

const DEFAULT_SECTION_CLASS =
  "w-full py-8 sm:py-10 md:py-12 px-4 sm:px-6 md:px-12 lg:px-16 bg-[#0a0e17] border-b border-white/5 last:border-b-0";

const VISIBLE_COUNT = 5;

export type HorizontalMovieRowProps = {
  title: string;
  subtitle?: string;
  movies: Movie[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  /** Khi đổi (vd genreId), reset vị trí carousel */
  listKey?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  posterCardClassName?: string;
  className?: string;
};

/**
 * Khung tái sử dụng: tiêu đề + link "Xem tất cả" + hàng poster cuộn ngang + nút prev/next.
 */
export function HorizontalMovieRow({
  title,
  subtitle,
  movies,
  loading = false,
  error = null,
  emptyMessage = "Chưa có phim.",
  listKey,
  viewAllHref,
  viewAllLabel = "Xem tất cả →",
  posterCardClassName = "flex-[0_0_20%] max-w-[20%]",
  className,
}: HorizontalMovieRowProps) {
  const [startIndex, setStartIndex] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setStartIndex(0);
    listRef.current?.scrollTo({ left: 0 });
  }, [listKey]);

  const canPrev = startIndex > 0;
  const canNext = startIndex + VISIBLE_COUNT < movies.length;

  return (
    <section
      className={[DEFAULT_SECTION_CLASS, className ?? ""].join(" ")}
    >
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
            {title}
          </h2>
          {viewAllHref ? (
            <Link
              href={viewAllHref}
              className="text-sm text-yellow-500 hover:text-yellow-400 font-semibold whitespace-nowrap"
            >
              {viewAllLabel}
            </Link>
          ) : (
            <span className="w-px" aria-hidden />
          )}
        </div>
        {subtitle ? (
          <p className="text-sm text-gray-400 mt-2 max-w-3xl">{subtitle}</p>
        ) : null}
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[160px]">
          <Spinner size="lg" color="white" />
        </div>
      ) : error ? (
        <div className="text-gray-300 text-sm">{error}</div>
      ) : movies.length === 0 ? (
        <div className="text-gray-400 text-sm">{emptyMessage}</div>
      ) : (
        <div className="relative pb-2">
          {canPrev && (
            <button
              type="button"
              className="hidden sm:flex items-center justify-center absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-yellow-500 text-black shadow-lg hover:bg-yellow-400"
              onClick={() => {
                if (!canPrev) return;
                setStartIndex((prev) => Math.max(0, prev - 1));
                const container = listRef.current;
                if (container?.firstElementChild) {
                  const itemWidth =
                    (container.firstElementChild as HTMLElement).getBoundingClientRect()
                      .width + 16;
                  container.scrollBy({ left: -itemWidth, behavior: "smooth" });
                }
              }}
            >
              ‹
            </button>
          )}

          {canNext && (
            <button
              type="button"
              className="hidden sm:flex items-center justify-center absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-yellow-500 text-black shadow-lg hover:bg-yellow-400"
              onClick={() => {
                if (!canNext) return;
                setStartIndex((prev) =>
                  Math.min(
                    Math.max(movies.length - VISIBLE_COUNT, 0),
                    prev + 1,
                  ),
                );
                const container = listRef.current;
                if (container?.firstElementChild) {
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
                className={posterCardClassName}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
