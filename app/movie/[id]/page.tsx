"use client";
import { getMovieDetails } from "@/api/api";
import PageWrapper from "@/components/layout/page-wrapper";
import MovieActions from "@/components/movie/MovieActions";
import MovieBanner from "@/components/movie/MovieBanner";
import MovieComments from "@/components/movie/MovieComments";
import MovieInfo from "@/components/movie/MovieInfo";
import MovieTabs from "@/components/movie/MovieTabs";
import TopMoviesWeek from "@/components/movie/TopMoviesWeek";
import { errorToast } from "@/components/ui/toast";
import { setCurrentMovie } from "@/store/slices/movieSlice";
import { Movie } from "@/types";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@heroui/button";
import { FiHeart } from "react-icons/fi";

const DetailMoviePage = () => {
  const param = useParams();
  const movieId = param.id as string;

  const [movie, setMovie] = useState<Movie>();
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await getMovieDetails(movieId);
        setMovie(res);
        dispatch(setCurrentMovie(res));
      } catch (error) {
        errorToast("Error", "Lỗi khi tải thông tin phim.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [movieId]);

  if (loading) {
    return (
      <PageWrapper>
        <div>Loading...</div>
      </PageWrapper>
    );
  }

  if (!movie) {
    return (
      <PageWrapper>
        <div>Movie not found.</div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Banner - Full Width */}
      <div className="w-full">
        <MovieBanner backdrop={movie.backdrop_url} />
      </div>

      {/* Content Container */}
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Cột trái - Poster & Info (1/4) */}
          <div className="space-y-8">
            <MovieInfo movie={movie} />
            {/* MovieActions on mobile */}
            <div className="lg:hidden">
              <MovieActions
                movieId={movie.id}
                trailerUrl={movie.trailer_url}
                avgRating={
                  movie.tmdb_vote_average
                    ? parseFloat(movie.tmdb_vote_average)
                    : undefined
                }
              />
            </div>
          </div>

          {/* Cột phải (3/4) */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cột giữa - Content (2/3) */}
              <div className="lg:col-span-2 space-y-8">
                {/* MovieActions on desktop only */}
                <div className="hidden lg:block">
                  <MovieActions
                    movieId={movie.id}
                    trailerUrl={movie.trailer_url}
                    avgRating={
                      movie.tmdb_vote_average
                        ? parseFloat(movie.tmdb_vote_average)
                        : undefined
                    }
                  />
                </div>

                {/* Actors Section */}
                {movie.actors && movie.actors.length > 0 && (
                  <div className="bg-white/5 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">
                      Diễn viên
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                      {movie.actors.slice(0, 12).map((actor) => (
                        <div
                          key={actor.id}
                          className="flex flex-col items-center group cursor-pointer"
                        >
                          {actor.profile_url ? (
                            <div className="relative w-16 h-16 rounded-full overflow-hidden mb-2 ring-2 ring-gray-700 group-hover:ring-yellow-500 transition-all">
                              <img
                                src={actor.profile_url}
                                alt={actor.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-2 ring-2 ring-gray-700 group-hover:ring-yellow-500 transition-all">
                              <span className="text-gray-400 text-lg font-bold">
                                {actor.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <p className="text-white text-xs text-center line-clamp-2 w-full">
                            {actor.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <MovieTabs movieId={movie.id} actors={movie.actors} />
                <MovieComments movieId={movie.id} />
              </div>

              {/* Cột phải - Rating Box (1/3) */}
              <div className="lg:col-span-1">
                <div className="bg-white/5 rounded-xl p-6 sticky top-24">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="flex items-center gap-2 text-gray-400">
                      <FiHeart className="text-xl" />
                      <span className="text-xs">Đánh giá</span>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-yellow-500 mb-1">
                        {avgRating?.toFixed(1) || "0.0"}
                      </div>
                      <span className="text-xs text-gray-400">Điểm phim</span>
                    </div>
                    <Button
                      fullWidth
                      color="primary"
                      className="font-bold"
                      size="md"
                    >
                      Đánh giá ngay
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Movies Week - Below everything */}
        <div className="mt-8">
          <TopMoviesWeek />
        </div>
      </div>
    </PageWrapper>
  );
};

export default DetailMoviePage;
