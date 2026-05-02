"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import { Image } from "@heroui/image";
import { AnimatePresence } from "framer-motion";
import { Movie } from "@/types";
import { MovieHoverCard } from "@/components/browse/movie-hover-card";

export type MoviePosterCardProps = {
  movie: Movie;
  href?: string;
  className?: string;
  imageClassName?: string;
};

export function MoviePosterCard({
  movie,
  href,
  className,
  imageClassName,
}: MoviePosterCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = React.useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 250);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(false);
  };

  const resolvedHref = href ?? `/movie/${movie.id}`;

  return (
    <div
      className={["relative flex-shrink-0", className ?? ""].join(" ")}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={() => router.push(resolvedHref)}
        className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-gray-800/50 cursor-pointer"
      >
        <Image
          removeWrapper
          src={movie.poster_url}
          alt={movie.title}
          className={[
            "w-full h-full object-cover",
            imageClassName ?? "",
          ].join(" ")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0" />
      </button>

      <div className="pt-2">
        <p className="text-white text-xs font-medium line-clamp-1">
          {movie.title}
        </p>
        {movie.release_year && (
          <p className="text-gray-400 text-xs">{movie.release_year}</p>
        )}
      </div>

      <AnimatePresence>
        {isHovered && (
          <MovieHoverCard
            movie={movie}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
