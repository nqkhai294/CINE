"use client";

import { useState } from "react";
import { Card, CardFooter } from "@heroui/card";
import { Image } from "@heroui/image";
import { Chip } from "@heroui/chip";
import { motion, AnimatePresence } from "framer-motion";
import { Movie } from "@/types";
import { getImageUrl, formatYear } from "@/lib/utils";
import { MovieHoverCard } from "@/components/movie-hover-card";

interface TopMoviesSectionProps {
  title: string;
  movies: Movie[];
}

export const TopMoviesSection = ({ title, movies }: TopMoviesSectionProps) => {
  const topMovies = movies.slice(0, 5);
  const [hoveredMovie, setHoveredMovie] = useState<number | null>(null);

  return (
    <section className="w-full py-12 px-6 md:px-12 lg:px-16 bg-[#0a0e17]">
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
        {title}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
            <Card isPressable className="relative h-[400px] bg-transparent">
              {/* Movie Poster */}
              <Image
                removeWrapper
                alt={movie.title}
                className="z-0 w-full h-full object-cover rounded-lg"
                src={getImageUrl(movie.poster_path, "w500")}
              />

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 rounded-lg" />

              {/* Rating Badge */}
              <Chip
                className="absolute top-3 left-3 bg-black/70 text-white font-semibold"
                size="sm"
                variant="flat"
              >
                P.Đề
              </Chip>

              {/* Category Badges */}
              <div className="absolute top-3 right-3 flex gap-2">
                <Chip
                  className="bg-warning/90 text-black font-semibold"
                  size="sm"
                  variant="flat"
                >
                  T.Mirth
                </Chip>
              </div>

              {/* Ranking Number */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-8xl md:text-9xl font-bold text-white/20 select-none">
                  {index + 1}
                </span>
              </div>

              {/* Movie Info Footer */}
              <CardFooter className="absolute bottom-0 z-10 flex-col items-start p-4">
                {/* Ranking Badge */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow-lg">
                    <span className="text-2xl font-bold text-black">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg line-clamp-2 mb-1">
                      {movie.title}
                    </h3>
                    <p className="text-gray-300 text-sm">
                      {movie.original_title}
                    </p>
                  </div>
                </div>

                {/* Movie Details */}
                <div className="flex items-center gap-3 text-sm text-gray-300 w-full">
                  <span className="px-2 py-0.5 bg-white/10 rounded">T18</span>
                  <span>{formatYear(movie.release_date)}</span>
                  <span>•</span>
                  <span>1h 48m</span>
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
