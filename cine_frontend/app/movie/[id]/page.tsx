"use client";
import { getMovieDetails } from "@/api/api";
import PageWrapper from "@/components/layout/page-wrapper";
import MovieActions from "@/components/movie/MovieActions";
import MovieBanner from "@/components/movie/MovieBanner";
import MovieComments from "@/components/movie/MovieComments";
import MovieInfo from "@/components/movie/MovieInfo";
import MovieTabs from "@/components/movie/MovieTabs";
import { errorToast } from "@/components/ui/toast";
import { Spinner } from "@heroui/spinner";
import { setCurrentMovie } from "@/store/slices/movieSlice";
import { Movie } from "@/types";
import { useParams } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";

const DetailMoviePage = () => {
  const param = useParams();
  const movieId = param.id as string;

  const [movie, setMovie] = useState<Movie>();
  const [loading, setLoading] = useState(true);
  const commentsRef = useRef<HTMLDivElement>(null);

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

  const scrollToComments = () => {
    commentsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex min-h-[55vh] w-full items-center justify-center px-4">
          <div
            role="status"
            aria-live="polite"
            className="flex flex-col items-center gap-5 rounded-2xl border border-white/10 bg-[#151b26]/95 px-10 py-12 shadow-2xl backdrop-blur-sm"
          >
            <Spinner size="lg" color="warning" />
            <p className="text-sm text-gray-400">Đang tải thông tin phim…</p>
          </div>
        </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột trái */}
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
                onCommentClick={scrollToComments}
              />
            </div>
          </div>

          {/* Cột phải */}
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
                onCommentClick={scrollToComments}
              />
            </div>
            <MovieTabs movieId={movie.id} actors={movie.actors} />
            <div ref={commentsRef}>
              <MovieComments movieId={movie.id} />
            </div>
          </div>
        </div>

        {/* Top Movies Week - Below everything */}
        <div className="mt-8">{/* <TopMoviesWeek /> */}</div>
      </div>
    </PageWrapper>
  );
};

export default DetailMoviePage;
