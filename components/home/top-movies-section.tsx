"use client";

import { useEffect, useState } from "react";
import { Card, CardFooter } from "@heroui/card";
import { Image } from "@heroui/image";
import { Chip } from "@heroui/chip";
import { motion, AnimatePresence } from "framer-motion";
import { Movie } from "@/types";
import { MovieHoverCard } from "@/components/home/movie-hover-card";

interface TopMoviesSectionProps {
  title: string;
  movies: Movie[];
}

export const TopMoviesSection = ({ title, movies }: TopMoviesSectionProps) => {
  const topMovies = movies.slice(0, 10);
  const [hoveredMovie, setHoveredMovie] = useState<number | null>(null);

  useEffect(() => {
    console.log("topMovies updated:", topMovies);
  }, [topMovies]);

  return (
    <section className="w-full py-8 sm:py-10 md:py-12 px-4 sm:px-6 md:px-12 lg:px-16 bg-[#0a0e17]">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-6 sm:mb-8">
        {title}
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
        {topMovies.map((movie, index) => (
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative group cursor-pointer"
            onMouseEnter={() => setHoveredMovie(index)}
            onMouseLeave={() => setHoveredMovie(null)}
          >
            <Card
              isPressable
              className="relative h-[240px] sm:h-[300px] md:h-[350px] lg:h-[400px] bg-transparent"
            >
              {/* Movie Poster */}
              <Image
                removeWrapper
                alt={movie.title}
                className="z-0 w-full h-full object-cover rounded-lg"
                src={movie.poster_url}
              />

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 rounded-lg" />

              {/* Rating Badge */}
              <Chip
                className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-black/70 text-white font-semibold text-[10px] sm:text-xs"
                size="sm"
                variant="flat"
              >
                P.Đề
              </Chip>

              {/* Category Badges */}
              <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-1 sm:gap-2">
                <Chip
                  className="bg-warning/90 text-black font-semibold text-[10px] sm:text-xs"
                  size="sm"
                  variant="flat"
                >
                  T.Minh
                </Chip>
              </div>

              {/* Ranking Number */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
                <span className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-white/20 select-none">
                  {index + 1}
                </span>
              </div>

              {/* Movie Info Footer */}
              <CardFooter className="absolute bottom-0 z-10 flex-col items-start p-2 sm:p-3 md:p-4">
                {/* Ranking Badge */}
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-md sm:rounded-lg shadow-lg flex-shrink-0">
                    <span className="text-base sm:text-xl md:text-2xl font-bold text-black">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-xs sm:text-sm md:text-base lg:text-lg line-clamp-1 sm:line-clamp-2 mb-0.5 sm:mb-1">
                      {movie.title}
                    </h3>
                    <p className="text-gray-300 text-[10px] sm:text-xs md:text-sm line-clamp-1">
                      {movie.original_title}
                    </p>
                  </div>
                </div>

                {/* Movie Details */}
                <div className="hidden sm:flex items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-300 w-full">
                  <span className="px-1.5 md:px-2 py-0.5 bg-white/10 rounded text-[10px] md:text-xs">
                    T18
                  </span>
                  <span>{movie.release_year}</span>
                  <span>•</span>
                  <span>
                    {movie.runtime
                      ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
                      : "N/A"}
                  </span>
                </div>
              </CardFooter>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-warning/0 group-hover:bg-warning/10 transition-colors duration-300 rounded-lg" />
            </Card>

            {/* Hover Card */}
            <AnimatePresence>
              {hoveredMovie === index && (
                <MovieHoverCard
                  movie={movie}
                  onMouseEnter={() => setHoveredMovie(index)}
                  onMouseLeave={() => setHoveredMovie(null)}
                />
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
