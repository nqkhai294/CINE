"use client";

import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Image } from "@heroui/image";
import { motion } from "framer-motion";
import { Movie } from "@/types";
import { getImageUrl, formatYear, formatRating } from "@/lib/utils";
import { GENRE_MAP } from "@/config/constants";

interface MovieHoverCardProps {
  movie: Movie;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const MovieHoverCard = ({
  movie,
  onMouseEnter,
  onMouseLeave,
}: MovieHoverCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-[320px] z-50 bg-[#1a2332] rounded-lg shadow-2xl border border-gray-700 overflow-hidden"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Movie Poster */}
      <div className="relative h-[180px] w-full">
        <Image
          removeWrapper
          src={getImageUrl(movie.poster_path, "w500")}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a2332] via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Movie Title */}
        <h4 className="text-white font-bold text-lg mb-1 line-clamp-2">
          {movie.title}
        </h4>
        <p className="text-warning text-sm mb-3">
          {movie.original_title}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-3">
          <Button
            size="sm"
            color="warning"
            className="flex-1 font-medium text-xs"
            startContent={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            }
          >
            Xem ngay
          </Button>
          <Button
            size="sm"
            variant="bordered"
            isIconOnly
            className="border-gray-600 text-white hover:bg-white/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </Button>
          <Button
            size="sm"
            variant="bordered"
            isIconOnly
            className="border-gray-600 text-white hover:bg-white/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* Movie Info */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-300 mb-3">
          <Chip size="sm" className="bg-warning/20 text-warning font-semibold text-[10px]">
            IMDb {formatRating(movie.vote_average)}
          </Chip>
          <Chip size="sm" variant="bordered" className="border-gray-600 text-white text-[10px]">
            4K
          </Chip>
          <Chip size="sm" variant="bordered" className="border-gray-600 text-white text-[10px]">
            T18
          </Chip>
          <span>{formatYear(movie.release_date)}</span>
          <span>•</span>
          <span>2h 30m</span>
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-1.5">
          {movie.genre_ids.slice(0, 4).map((genreId) => (
            <span
              key={genreId}
              className="px-2 py-1 bg-white/5 rounded text-[11px] text-gray-300"
            >
              {GENRE_MAP[genreId] || "Khác"}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

