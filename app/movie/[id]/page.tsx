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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột trái */}
          <div className="space-y-8">
            <MovieInfo movie={movie} />
            <TopMoviesWeek />
          </div>

          {/* Cột phải */}
          <div className="lg:col-span-2 space-y-8">
            <MovieActions
              movieId={movie.id}
              trailerUrl={movie.trailer_url}
              avgRating={
                movie.tmdb_vote_average
                  ? parseFloat(movie.tmdb_vote_average)
                  : undefined
              }
            />
            <MovieTabs movieId={movie.id} actors={movie.actors} />
            <MovieComments movieId={movie.id} />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default DetailMoviePage;
