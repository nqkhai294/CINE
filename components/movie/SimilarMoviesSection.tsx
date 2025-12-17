"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Movie } from "@/types";
import { getSimilarMovies } from "@/api/api";
import { MovieHoverCard } from "@/components/home/movie-hover-card";

interface SimilarMoviesSectionProps {
  movieId: string;
  title?: string;
}

const SimilarMoviesSection = ({
  movieId,
  title = "Các phim tương tự",
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {similarMovies.map((movie) => (
            <div
              key={movie.id}
              className="relative"
              onMouseEnter={() => setHoveredMovie(movie.id)}
              onMouseLeave={() => setHoveredMovie(null)}
            >
              <Link href={`/movie/${movie.id}`} className="block group">
                <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden">
                  <Image
                    src={movie.poster_url}
                    alt={movie.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
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
                </div>
              </Link>

              {/* Hover Card */}
              {hoveredMovie === movie.id && (
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
