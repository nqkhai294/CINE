import { Movie } from "@/types";
import { Chip } from "@heroui/chip";
import React from "react";

interface MovieInfoProps {
  movie: Movie;
}

const MovieInfo = ({ movie }: MovieInfoProps) => {
  return (
    <div className="flex flex-col gap-4 items-center text-center lg:items-start lg:text-left">
      {/* Poster */}
      <img
        src={movie.poster_url}
        alt={movie.title}
        className="w-56 sm:w-64 md:w-72 lg:w-full max-w-md mx-auto rounded-lg shadow-2xl object-cover"
      />

      {/* Info */}
      <div className="w-full">
        <h1 className="text-2xl font-bold mb-2">{movie.title}</h1>

        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-3">
          <Chip
            size="sm"
            className="font-semibold text-xs rounded-md bg-black border-1 border-amber-400"
            startContent={
              <span className="text-xs text-amber-400 mr-1">IMDb</span>
            }
          >
            <span className="text-white">{movie.tmdb_vote_average}</span>
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
            {movie.release_year}
          </Chip>
          <Chip
            size="sm"
            variant="bordered"
            className="text-white border-white/50 text-xs rounded-md"
          >
            {movie.runtime
              ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
              : "N/A"}
          </Chip>
        </div>

        {/* Genre Tags */}
        <div className="flex flex-wrap gap-2 mb-4 justify-center lg:justify-start">
          {movie.genres.map((genre) => (
            <span
              key={genre}
              className="px-2 py-0.5 bg-white/10 backdrop-blur-sm rounded-full text-xs text-white"
            >
              {genre || "Khác"}
            </span>
          ))}
        </div>

        {/* Summary - left aligned even on small screens */}
        <div className="w-full text-left">
          <p className="text-white pb-2">Summary:</p>
          <p className="text-gray-300 text-sm leading-relaxed">
            {movie.summary}
          </p>
        </div>

        {/* Additional Info - left aligned */}
        <div className="mt-4 space-y-2 w-full text-left">
          {/* Thời lượng */}
          <div className="flex items-start gap-2">
            <span className="text-white font-semibold text-sm whitespace-nowrap">
              Thời lượng:
            </span>
            <span className="text-gray-300 text-sm">
              {movie.runtime
                ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
                : "N/A"}
            </span>
          </div>

          {/* Quốc gia */}
          <div className="flex items-start gap-2">
            <span className="text-white font-semibold text-sm whitespace-nowrap">
              Quốc gia:
            </span>
            <span className="text-gray-300 text-sm">
              {movie.original_language?.toUpperCase() || "N/A"}
            </span>
          </div>

          {/* Sản xuất */}
          {movie.directors && movie.directors.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="text-white font-semibold text-sm whitespace-nowrap">
                Sản xuất:
              </span>
              <span className="text-gray-300 text-sm">
                {movie.directors.map((d) => d.name).join(", ")}
              </span>
            </div>
          )}

          {/* Đạo diễn */}
          {movie.directors && movie.directors.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="text-white font-semibold text-sm whitespace-nowrap">
                Đạo diễn:
              </span>
              <span className="text-gray-300 text-sm">
                {movie.directors.map((d) => d.name).join(", ")}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieInfo;
