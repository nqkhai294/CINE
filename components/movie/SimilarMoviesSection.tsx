"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Chip } from "@heroui/chip";
import { Movie } from "@/types";
import { getSimilarMovies } from "@/api/api";
import { MovieHoverCard } from "@/components/home/movie-hover-card";

interface SimilarMoviesSectionProps {
  movieId: string;
  title?: string;
  layout?: "horizontal" | "vertical";
}

const SimilarMoviesSection = ({
  movieId,
  title = "Các phim tương tự",
  layout = "horizontal",
}: SimilarMoviesSectionProps) => {
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [hoveredMovie, setHoveredMovie] = useState<string | null>(null);

  useEffect(() => {
    const fetchSimilarMovies = async () => {
      if (!movieId) return;

      setLoadingSimilar(true);
      try {
        const movies = await getSimilarMovies(movieId);
        setSimilarMovies(movies);
      } catch (error) {
        console.error("Error fetching similar movies:", error);
      } finally {
        setLoadingSimilar(false);
      }
    };

    fetchSimilarMovies();
  }, [movieId]);

  return (
    <div className="py-6">
      <h3 className="text-xl font-bold text-white mb-6">{title}</h3>

      {loadingSimilar ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          <p className="text-gray-400 mt-4">Đang tải phim đề xuất...</p>
        </div>
      ) : similarMovies.length > 0 ? (
        <div
          className={
            layout === "vertical"
              ? "flex flex-col gap-4"
              : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
          }
        >
          {similarMovies.map((movie) => (
            <div
              key={movie.id}
              className="relative"
              onMouseEnter={() => setHoveredMovie(movie.id)}
              onMouseLeave={() => setHoveredMovie(null)}
            >
              <Link
                href={`/movie/${movie.id}`}
                className={`block group ${layout === "vertical" ? "flex gap-3" : ""}`}
              >
                <div
                  className={
                    layout === "vertical"
                      ? "relative w-24 h-36 rounded-lg overflow-hidden flex-shrink-0"
                      : "relative w-full aspect-[2/3] rounded-lg overflow-hidden"
                  }
                >
                  <Image
                    src={movie.poster_url}
                    alt={movie.title}
                    fill
                    sizes={
                      layout === "vertical"
                        ? "96px"
                        : "(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                    }
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {layout === "horizontal" && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h4 className="text-white font-semibold text-sm line-clamp-2">
                          {movie.title}
                        </h4>
                        <p className="text-yellow-500 text-xs mt-1">
                          ⭐ {movie.tmdb_vote_average}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {layout === "vertical" && (
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold text-sm line-clamp-2 mb-2">
                      {movie.title}
                    </h4>

                    {/* Chips Row */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      {/* IMDb Rating */}
                      <Chip
                        size="sm"
                        className="font-semibold text-xs rounded-md bg-black border-1 border-amber-400"
                        startContent={
                          <span className="text-xs text-amber-400 mr-1">
                            IMDb
                          </span>
                        }
                      >
                        <span className="text-white">
                          {movie.tmdb_vote_average || "N/A"}
                        </span>
                      </Chip>

                      {/* T18 */}
                      <Chip
                        size="sm"
                        variant="bordered"
                        className="text-white border-white/50 text-xs rounded-md"
                      >
                        T18
                      </Chip>

                      {/* Year */}
                      <Chip
                        size="sm"
                        variant="bordered"
                        className="text-white border-white/50 text-xs rounded-md"
                      >
                        {movie.release_year || "N/A"}
                      </Chip>

                      {/* Runtime */}
                      {movie.runtime && (
                        <Chip
                          size="sm"
                          variant="bordered"
                          className="text-white border-white/50 text-xs rounded-md"
                        >
                          {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}
                          m
                        </Chip>
                      )}
                    </div>

                    {/* Genre Tags */}
                    {movie.genres && movie.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {movie.genres.slice(0, 2).map((genre, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-white/10 backdrop-blur-sm rounded-full text-xs text-white"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Link>

              {/* Hover Card - Only for horizontal layout */}
              {layout === "horizontal" && hoveredMovie === movie.id && (
                <div
                  className="absolute top-0 left-0 w-full z-50"
                  onMouseEnter={() => setHoveredMovie(movie.id)}
                  onMouseLeave={() => setHoveredMovie(null)}
                >
                  <MovieHoverCard
                    movie={movie}
                    onMouseEnter={() => setHoveredMovie(movie.id)}
                    onMouseLeave={() => setHoveredMovie(null)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400">Không có phim đề xuất</p>
        </div>
      )}
    </div>
  );
};

export default SimilarMoviesSection;
