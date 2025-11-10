"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Movie } from "@/types";
import { GENRE_MAP } from "@/config/constants";

interface MovieHeroProps {
  movies: Movie[];
}

export const MovieHero = ({ movies }: MovieHeroProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentMovie = movies[currentIndex];

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  const getSixNewestMovies = () => {};

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Image with Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMovie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${currentMovie.backdrop_url})`,
            }}
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end pb-32 px-6 md:px-12 lg:px-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMovie.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 uppercase tracking-wide">
              {currentMovie.title}
            </h1>

            {/* Movie Info */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Chip
                color="warning"
                size="sm"
                className="font-semibold text-xs rounded-md"
                startContent={<span className="text-xs mr-1">IMDb</span>}
              >
                {currentMovie.tmdb_vote_average}
              </Chip>
              <Chip
                size="sm"
                variant="bordered"
                className="text-white border-white/50 text-xs rounded-md"
              >
                T18
              </Chip>
              <Chip
                size="sm"
                variant="bordered"
                className="text-white border-white/50 text-xs rounded-md"
              >
                {currentMovie.release_year}
              </Chip>
              <Chip
                size="sm"
                variant="bordered"
                className="text-white border-white/50 text-xs rounded-md"
              >
                1h 48m
              </Chip>
            </div>

            {/* Genre Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {currentMovie.genres.map((genre) => (
                <span
                  key={genre}
                  className="px-2 py-0.5 bg-white/10 backdrop-blur-sm rounded-full text-xs text-white"
                >
                  {genre || "Khác"}
                </span>
              ))}
            </div>

            {/* Description */}
            <p className="text-white/90 text-sm md:text-base mb-6 line-clamp-3 max-w-2xl">
              {currentMovie.summary}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                size="md"
                color="warning"
                className="font-medium text-base px-6"
                startContent={
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                }
              >
                Xem Phim
              </Button>
              <Button
                size="md"
                variant="bordered"
                className="font-medium text-base px-6 text-white border-white/50 hover:bg-white/10"
                startContent={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                }
              >
                Yêu Thích
              </Button>
              <Button
                size="md"
                variant="bordered"
                isIconOnly
                className="text-white border-white/50 hover:bg-white/10"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" strokeWidth={2} />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 16v-4m0-4h.01"
                  />
                </svg>
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Thumbnails Carousel */}
        <div className="absolute bottom-12 right-6 flex gap-2">
          {movies.map((movie, index) => (
            <motion.button
              key={movie.id}
              onClick={() => handleThumbnailClick(index)}
              className={clsx(
                "relative flex-shrink-0 w-20 h-12 rounded overflow-hidden transition-all duration-300 border-2",
                currentIndex === index
                  ? "border-warning shadow-lg shadow-warning/50"
                  : "border-transparent hover:border-white/50 opacity-70 hover:opacity-100"
              )}
              whileHover={{ scale: currentIndex === index ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src={movie.backdrop_url}
                alt={movie.title}
                className="w-full h-full object-cover object-center"
              />
              {currentIndex === index && (
                <div className="absolute inset-0 bg-gradient-to-t from-warning/30 to-transparent" />
              )}
            </motion.button>
          ))}
        </div>
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
    </div>
  );
};
