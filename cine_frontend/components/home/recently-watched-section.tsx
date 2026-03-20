"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Image } from "@heroui/image";
import { useAppSelector } from "@/store/hooks";
import { getProgressingMovies, type ProgressingMovie } from "@/api/api";

type RecentlyWatchedItem = ProgressingMovie;

function clamp01(n: number) {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

export function RecentlyWatchedSection({
  title = "Recently watched",
}: {
  title?: string;
}) {
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const [items, setItems] = useState<RecentlyWatchedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getProgressingMovies()
      .then((data) => {
        if (!cancelled) {
          setItems(data ?? []);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;
  if (!loading && items.length === 0) return null;

  const list = items;

  return (
    <section className="w-full py-8 sm:py-10 md:py-12 px-4 sm:px-6 md:px-12 lg:px-16 bg-[#0a0e17]">
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
          {title}
        </h2>
      </div>

      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {list.map((m) => {
          const ratio = clamp01(
            m.duration > 0 ? m.progress_seconds / m.duration : 0,
          );
          const percent = Math.round(ratio * 100);

          return (
            <div
              key={m.movie_id}
              className="flex-shrink-0 w-[220px] sm:w-[280px]"
            >
              <button
                type="button"
                onClick={() => router.push(`/movie/${m.movie_id}`)}
                className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-800/50 cursor-pointer group"
                aria-label={`Tiếp tục xem: ${m.title}`}
              >
                <Image
                  removeWrapper
                  src={m.backdrop_url}
                  alt={m.title}
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-90 z-10" />

                {/* Progress bar (YouTube-like) */}
                <div className="absolute left-0 right-0 bottom-0 h-[4px] bg-black/60 z-20">
                  <div
                    className="h-full bg-red-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </button>

              <div className="pt-2">
                <p className="text-white text-sm font-semibold line-clamp-1">
                  {m.title}
                </p>
                <p className="text-gray-400 text-xs mt-0.5">{percent}%</p>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
