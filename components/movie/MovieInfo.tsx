import { Movie, MovieDetail } from "@/types";
import { Chip } from "@heroui/chip";
import React from "react";

interface MovieInfoProps {
  movie: Movie;
}

const MovieInfo = ({ movie }: MovieInfoProps) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Poster */}
      <img
        src={movie.poster_url}
        alt={movie.title}
        className="w-1/2 rounded-lg shadow-2xl object-cover"
      />

      {/* Info */}
      <div>
        <h1 className="text-2xl font-bold mb-2">{movie.title}</h1>

        <div className="flex flex-wrap items-center gap-2 mb-3">
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
            {movie.runtime}
          </Chip>
        </div>

        {/* Genre Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {movie.genres.map((genre) => (
            <span
              key={genre}
              className="px-2 py-0.5 bg-white/10 backdrop-blur-sm rounded-full text-xs text-white"
            >
              {genre || "Khác"}
            </span>
          ))}
        </div>

        <div>
          <p className="text-white  pb-2">Summary:</p>
          <p className="text-gray-300 text-sm leading-relaxed ">
            {movie.summary}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MovieInfo;
