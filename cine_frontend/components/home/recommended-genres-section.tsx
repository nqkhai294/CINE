"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getRecommendedGenres, type RecommendedGenre } from "@/api/api";
import { useAppSelector } from "@/store/hooks";
import { GenreMoviesRow } from "@/components/home/genre-movies-row";

/** Cùng rhythm với RecentlyWatchedSection / HorizontalMovieRow — full-bleed nền tối. */
const SECTION_SHELL =
  "w-full py-8 sm:py-10 md:py-12 px-4 sm:px-6 md:px-12 lg:px-16 bg-[#0a0e17] border-b border-white/5";

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

  if (!isAuthenticated) return null;
  if (loading) return null;
  if (genres.length === 0) return null;

  return (
    <>
      <section className={SECTION_SHELL}>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">
          Thể loại dành cho bạn
        </h2>
        <p className="text-sm text-gray-400 mb-4 sm:mb-6">
          Dựa trên phim bạn đã xem và đánh giá
        </p>
        <div className="flex flex-wrap gap-2">
          {genres.map((g) => (
            <Link
              key={g.genre_id}
              href={`/genre/${g.genre_id}`}
              className="inline-flex items-center rounded-full border border-yellow-500/50 bg-transparent px-3 py-1.5 text-sm font-medium text-yellow-400 transition-colors hover:bg-yellow-500/10 hover:text-yellow-300"
            >
              {g.genre_name}
            </Link>
          ))}
        </div>
      </section>

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

