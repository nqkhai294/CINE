"use client";

import React, { useState, useEffect } from "react";
import { Tabs, Tab } from "@heroui/tabs";
import Image from "next/image";
import Link from "next/link";
import { Actor, Movie } from "@/types";
import { getSimilarMovies } from "@/api/api";
import { MovieHoverCard } from "@/components/home/movie-hover-card";

interface MovieTabsProps {
  movieId?: string;
  actors?: Actor[];
}

const MovieTabs = ({ movieId = "", actors }: MovieTabsProps) => {
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
    <div className="w-full">
      <Tabs
        aria-label="Movie tabs"
        color="warning"
        variant="underlined"
        classNames={{
          tabList:
            "gap-8 w-full relative rounded-none p-0 border-b border-gray-800",
          cursor: "w-full bg-yellow-500",
          tab: "max-w-fit px-0 h-12",
          tabContent:
            "group-data-[selected=true]:text-yellow-500 text-gray-400 font-medium text-sm",
        }}
      >
        <Tab key="cast" title="Diễn viên">
          <div className="py-6">
            {actors && actors.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {actors.map((actor) => (
                  <div
                    key={actor.id}
                    className="flex flex-col items-center group cursor-pointer"
                  >
                    {/* Circular Avatar */}
                    {actor.profile_url ? (
                      <div className="relative w-24 h-24 rounded-full overflow-hidden mb-3 ring-2 ring-gray-700 group-hover:ring-yellow-500 transition-all">
                        <Image
                          src={actor.profile_url}
                          alt={actor.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mb-3 ring-2 ring-gray-700 group-hover:ring-yellow-500 transition-all">
                        <span className="text-gray-400 text-xl font-bold">
                          {actor.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {/* Actor Name */}
                    <p className="text-white font-medium text-sm text-center line-clamp-2 w-full">
                      {actor.name}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">
                Chưa có thông tin diễn viên
              </p>
            )}
          </div>
        </Tab>

        <Tab key="gallery" title="Gallery">
          <div className="py-6">
            <p className="text-gray-400 text-center py-8">
              Thư viện ảnh đang được cập nhật...
            </p>
          </div>
        </Tab>

        <Tab key="recommended" title="Đề xuất">
          <div className="py-6">
            <h3 className="text-xl font-bold text-white mb-6">
              Các phim tương tự
            </h3>

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
        </Tab>
      </Tabs>
    </div>
  );
};

export default MovieTabs;
