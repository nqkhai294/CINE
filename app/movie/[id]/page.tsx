"use client";
import { getMovieDetails } from "@/api/api";
import PageWrapper from "@/components/layout/page-wrapper";
import MovieActions from "@/components/movie/MovieActions";
import MovieBanner from "@/components/movie/MovieBanner";
import MovieCast from "@/components/movie/MovieCast";
import MovieComments from "@/components/movie/MovieComments";
import MovieInfo from "@/components/movie/MovieInfo";
import MovieTabs from "@/components/movie/MovieTabs";
import TopMoviesWeek from "@/components/movie/TopMoviesWeek";
import { errorToast } from "@/components/ui/toast";
import { Movie } from "@/types";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const DetailMoviePage = () => {
  const param = useParams();
  const movieId = param.id as string;

  const [movie, setMovie] = useState<Movie>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await getMovieDetails(movieId);
        console.log("Movie Details:", res);
        setMovie(res);
      } catch (error) {
        errorToast("Error", "Lỗi khi tải thông tin phim.");
        console.log("Error fetching movie details:", error);
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
      {/* Banner */}
      <MovieBanner backdrop={movie.backdrop_url} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mx-8">
        {/* Cột trái */}

        <div className="space-y-8">
          <MovieInfo movie={movie} />
          <MovieCast cast={movie.cast} />
          <TopMoviesWeek />
        </div>

        {/* Cột phải */}

        <div className="lg:col-span-2  space-y-8">
          <MovieActions movieId={movie.id} />
          <MovieTabs movieId={movie.id} />
          <MovieComments movieId={movie.id} />
        </div>
      </div>
    </PageWrapper>
  );
};

export default DetailMoviePage;
