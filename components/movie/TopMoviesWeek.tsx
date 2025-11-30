import React from "react";
import Image from "next/image";
import { FaStar } from "react-icons/fa";

const TopMoviesWeek = () => {
  // Mock data - sẽ thay bằng API call thực tế
  const topMovies = [
    {
      id: 1,
      title: "Movie Title 1",
      poster: "/placeholder-poster.jpg",
      rating: 4.5,
    },
    {
      id: 2,
      title: "Movie Title 2",
      poster: "/placeholder-poster.jpg",
      rating: 4.2,
    },
    {
      id: 3,
      title: "Movie Title 3",
      poster: "/placeholder-poster.jpg",
      rating: 4.0,
    },
  ];

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4">Top phim tuần</h3>
      <div className="space-y-4">
        {topMovies.map((movie, index) => (
          <div
            key={movie.id}
            className="flex gap-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all cursor-pointer"
          >
            <span className="text-2xl font-bold text-yellow-500 w-8 flex-shrink-0">
              {index + 1}
            </span>
            <div className="relative w-16 h-24 rounded overflow-hidden flex-shrink-0">
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <span className="text-gray-500 text-xs">No image</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium mb-1 truncate">
                {movie.title}
              </h4>
              <div className="flex items-center gap-1">
                <FaStar className="text-yellow-500 text-sm" />
                <span className="text-gray-300 text-sm">{movie.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopMoviesWeek;
