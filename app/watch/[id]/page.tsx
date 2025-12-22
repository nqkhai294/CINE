"use client";
import PageWrapper from "@/components/layout/page-wrapper";
import ReactPlayer from "react-player";
import { Movie } from "@/types";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaExclamationTriangle,
  FaHeart,
  FaLightbulb,
  FaPlay,
  FaPlus,
  FaRegHeart,
  FaShare,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  addToFavouritesList,
  addToWatchlist,
  getMovieDetails,
  removeFromFavouritesList,
  removeFromWatchlist,
  addToHistoryWatch,
} from "@/api/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { errorToast, successToast, warningToast } from "@/components/ui/toast";
import {
  addToWatchlist as addToWatchlistAction,
  removeFromWatchlist as removeFromWatchlistAction,
} from "@/store/slices/watchlistSlice";
import {
  addToFavouritesList as addToFavouritesAction,
  removeFromFavouritesList as removeFromFavouritesAction,
} from "@/store/slices/favouritesSlice";
import { FiHeart, FiPlus } from "react-icons/fi";
import { Chip } from "@heroui/chip";
import MovieComments from "@/components/movie/MovieComments";
import SimilarMoviesSection from "@/components/movie/SimilarMoviesSection";
import Image from "next/image";

const WatchMoviePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAddingToWatchlist, setIsAddingToWatchlist] = useState(false);
  const [isAddingToFavourites, setIsAddingToFavourites] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const param = useParams();
  const movieId = param.id as string;

  const dispatch = useAppDispatch();
  const { movieIds: watchlistIds } = useAppSelector((state) => state.watchlist);
  const { movieIds: favouritesIds } = useAppSelector(
    (state) => state.favourites
  );

  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const isInWatchlist = watchlistIds.includes(movieId);
  const isInFavourites = favouritesIds.includes(movieId);

  const [movie, setMovie] = useState<Movie | null>(null);
  const cachedMovie = useSelector(
    (state: RootState) => state.movie.currentMovie
  );

  useEffect(() => {
    const fetchData = async () => {
      if (cachedMovie) {
        setLoading(false);
        setMovie(cachedMovie);
      } else {
        try {
          const data = await getMovieDetails(movieId);
          setMovie(data);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching movie details:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [movieId, cachedMovie]);

  // Ghi lịch sử xem phim khi vào trang
  useEffect(() => {
    const recordWatchHistory = async () => {
      // Chỉ ghi lịch sử khi user đã đăng nhập
      if (!isAuthenticated) {
        return;
      }

      try {
        await addToHistoryWatch({ movieId });
        console.log("Watch history recorded for movie:", movieId);
      } catch (error) {
        // Không hiện lỗi cho user, chỉ log
        console.error("Error recording watch history:", error);
      }
    };

    recordWatchHistory();
  }, [movieId, isAuthenticated]);

  const handleWatchlistToggle = async () => {
    if (!isAuthenticated) {
      errorToast("Lỗi", "Vui lòng đăng nhập để sử dụng tính năng này");
      return;
    }

    setIsAddingToWatchlist(true);
    try {
      if (isInWatchlist) {
        await removeFromWatchlist(movieId);
        dispatch(removeFromWatchlistAction(movieId));
        warningToast("Đã xóa", "Đã xóa khỏi danh sách xem sau");
      } else {
        await addToWatchlist(movieId);
        dispatch(addToWatchlistAction(movieId));
        successToast("Thành công", "Đã thêm vào danh sách xem sau");
      }
    } catch (error: any) {
      errorToast("Lỗi", error.message || "Có lỗi xảy ra");
    } finally {
      setIsAddingToWatchlist(false);
    }
  };

  const handleFavouritesToggle = async () => {
    if (!isAuthenticated) {
      errorToast("Lỗi", "Vui lòng đăng nhập để sử dụng tính năng này");
      return;
    }

    setIsAddingToFavourites(true);
    try {
      if (isInFavourites) {
        await removeFromFavouritesList(movieId);
        dispatch(removeFromFavouritesAction(movieId));
        warningToast("Đã xóa", "Đã xóa khỏi danh sách yêu thích");
      } else {
        await addToFavouritesList(movieId);
        dispatch(addToFavouritesAction(movieId));
        successToast("Thành công", "Đã thêm vào danh sách yêu thích");
      }
    } catch (error: any) {
      errorToast("Lỗi", error.message || "Có lỗi xảy ra");
    } finally {
      setIsAddingToFavourites(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex  w-full items-center justify-center  text-white">
          <Spinner size="lg" color="white" />
        </div>
      </PageWrapper>
    );
  }

  if (!movie) {
    return (
      <PageWrapper>
        <div className="flex  w-full flex-col items-center justify-center  text-white gap-4">
          <h1 className="text-2xl">Không tìm thấy phim</h1>
          <Button onClick={() => router.push("/")} color="primary">
            Về trang chủ
          </Button>
        </div>
      </PageWrapper>
    );
  }

  const videoSource = movie.video_url || movie.trailer_url;

  return (
    <PageWrapper>
      <div className="min-h-screen text-white">
        {/* 1.Header */}
        <header className="flex items-center gap-3 px-4  mb-4 backdrop-blur-sm">
          <Button
            isIconOnly
            variant="light"
            radius="full"
            className="text-white hover:bg-white/20 transition-colors flex-shrink-0"
            onPress={() => router.back()}
          >
            <FaArrowLeft size={20} />
          </Button>

          <div className="flex-1 min-w-0">
            <p className="text-base sm:text-lg font-bold truncate">
              Xem phim {movie.title}
            </p>
          </div>
        </header>

        {/* 2.Video Player */}
        <div className="w-[90vw] rounded-sm bg-black relative aspect-video max-h-[90vh] mx-auto">
          {videoSource ? (
            <>
              <ReactPlayer
                src={videoSource}
                width="100%"
                height="100%"
                controls={true}
                playing={isPlaying}
                pip={false}
                style={{ backgroundColor: "black" }}
              />

              {/* Play Button Overlay */}
              {!isPlaying && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer group"
                  onClick={() => setIsPlaying(true)}
                >
                  <div className="w-20 h-20 flex items-center justify-center rounded-full bg-yellow-500 hover:bg-yellow-600 transition-all shadow-2xl group-hover:scale-110">
                    <FaPlay className="text-black text-3xl ml-1" />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              <p>Chưa có nguồn phát cho phim này.</p>
            </div>
          )}
        </div>

        {/* 3.Movie Title */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
            {/* Trái: Các nút tương tác */}
            <div className="flex flex-wrap gap-2 md:gap-4">
              <Button
                isIconOnly
                className={`${
                  isInFavourites
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-[#2a3544] hover:bg-[#364152]"
                } h-11 w-11 rounded-full transition-all`}
                size="md"
                onPress={handleFavouritesToggle}
                isLoading={isAddingToFavourites}
              >
                <FiHeart
                  className={`text-lg ${isInFavourites ? "text-white fill-current" : "text-white"}`}
                />
              </Button>

              <Button
                isIconOnly
                className={`${
                  isInWatchlist
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-[#2a3544] hover:bg-[#364152]"
                } h-11 w-11 rounded-full transition-all`}
                size="md"
                onPress={handleWatchlistToggle}
                isLoading={isAddingToWatchlist}
              >
                <FiPlus
                  className={`text-lg ${isInWatchlist ? "text-black" : "text-white"}`}
                />
              </Button>

              <Button
                variant="light"
                className="text-gray-400 hover:text-white"
                startContent={<FaLightbulb />}
              >
                Rạp phim{" "}
                <span className="ml-1 bg-gray-700 text-white text-[10px] px-1 rounded">
                  OFF
                </span>
              </Button>
            </div>

            {/* Phải: Chia sẻ & Báo lỗi */}
            <div className="flex gap-2">
              <Button
                variant="light"
                className="text-gray-400 hover:text-white"
                startContent={<FaShare />}
              >
                Chia sẻ
              </Button>
              <Button
                variant="light"
                color="danger"
                className="hover:bg-danger/10"
                startContent={<FaExclamationTriangle />}
              >
                Báo lỗi
              </Button>
            </div>
          </div>
        </div>

        {/* 4. MOVIE INFO & RATING */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: Movie Info */}
            <div className="flex-1 flex gap-6">
              {/* Poster */}
              <div className="w-32 md:w-48 flex-shrink-0">
                <img
                  src={movie.poster_url || ""}
                  alt={movie.title}
                  className="w-full rounded-lg shadow-2xl object-cover"
                />
              </div>

              {/* Details */}
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  {movie.title}
                </h2>
                <p className="text-gray-400 mb-4">
                  {movie.original_title || movie.title}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Chip
                    size="sm"
                    className="font-semibold text-xs rounded-md bg-black border-1 border-amber-400"
                    startContent={
                      <span className="text-xs text-amber-400 mr-1">IMDb</span>
                    }
                  >
                    <span className="text-white">
                      {movie.tmdb_vote_average ||
                        movie.avg_rating?.toFixed(1) ||
                        "N/A"}
                    </span>
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
                  {movie.runtime && (
                    <Chip
                      size="sm"
                      variant="bordered"
                      className="text-white border-white/50 text-xs rounded-md"
                    >
                      {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                    </Chip>
                  )}
                </div>

                {/* Genre Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre}
                      className="px-2 py-0.5 bg-white/10 backdrop-blur-sm rounded-full text-xs text-white"
                    >
                      {genre || "Khác"}
                    </span>
                  ))}
                </div>

                <div className="mb-6">
                  <p className="text-white pb-2">Summary:</p>
                  <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                    {movie.summary || "Đang cập nhật nội dung..."}
                  </p>
                </div>

                {/* Additional Info */}
                <div className="space-y-2">
                  {movie.runtime && (
                    <div className="flex items-start gap-2">
                      <span className="text-white font-semibold text-sm whitespace-nowrap">
                        Thời lượng:
                      </span>
                      <span className="text-gray-300 text-sm">
                        {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                      </span>
                    </div>
                  )}

                  {movie.original_language && (
                    <div className="flex items-start gap-2">
                      <span className="text-white font-semibold text-sm whitespace-nowrap">
                        Quốc gia:
                      </span>
                      <span className="text-gray-300 text-sm">
                        {movie.original_language.toUpperCase()}
                      </span>
                    </div>
                  )}

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

                {/* Link to Movie Detail Page */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <Button
                    variant="light"
                    className="text-yellow-500 hover:text-yellow-400 p-0 h-auto"
                    onPress={() => router.push(`/movie/${movieId}`)}
                  >
                    → Xem chi tiết phim
                  </Button>
                </div>
              </div>
            </div>

            {/* Right: Rating Box */}
            <div className="w-full lg:w-80 space-y-6">
              {/* Rating Box */}
              <div className="bg-white/5 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-center flex-1 border-r border-white/10">
                    <FaHeart className="mx-auto text-2xl mb-1 text-gray-400" />
                    <span className="text-xs text-gray-400">Đánh giá</span>
                  </div>
                  <div className="text-center flex-1">
                    <div className="mx-auto text-3xl mb-1 font-bold text-primary">
                      {movie.avg_rating?.toFixed(1) || "9.0"}
                    </div>
                    <span className="text-xs text-gray-400">Điểm phim</span>
                  </div>
                </div>
                <Button fullWidth color="primary" className="font-bold">
                  Đánh giá ngay
                </Button>
              </div>

              {/* Actors Section */}
              {movie.actors && movie.actors.length > 0 && (
                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">
                    Diễn viên
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {movie.actors.slice(0, 6).map((actor) => (
                      <div
                        key={actor.id}
                        className="flex flex-col items-center group cursor-pointer"
                      >
                        {actor.profile_url ? (
                          <div className="relative w-16 h-16 rounded-full overflow-hidden mb-2 ring-2 ring-gray-700 group-hover:ring-yellow-500 transition-all">
                            <Image
                              src={actor.profile_url}
                              alt={actor.name}
                              fill
                              sizes="64px"
                              className="object-cover"
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
            </div>
          </div>
        </div>

        {/* 5. COMMENTS & SIDEBAR */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: Comments Section */}
            <div className="flex-1">
              <MovieComments movieId={movieId} />
            </div>

            {/* Right: Recommendations */}
            <div className="w-full lg:w-80">
              {/* Similar Movies Section */}
              <SimilarMoviesSection
                movieId={movieId}
                title="Phim đề xuất"
                layout="vertical"
              />
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default WatchMoviePage;
