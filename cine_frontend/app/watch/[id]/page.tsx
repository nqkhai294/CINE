"use client";
import PageWrapper from "@/components/layout/page-wrapper";
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
  FaStar,
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
  getWatchProgress,
  upsertWatchProgress,
  addRatingToMovie,
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
import { VideoPlayer } from "@/components/movie/watch/VideoPlayer";

const WatchMoviePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAddingToWatchlist, setIsAddingToWatchlist] = useState(false);
  const [isAddingToFavourites, setIsAddingToFavourites] = useState(false);

  const param = useParams();
  const movieId = param.id as string;

  const dispatch = useAppDispatch();
  const { movieIds: watchlistIds } = useAppSelector((state) => state.watchlist);
  const { movieIds: favouritesIds } = useAppSelector(
    (state) => state.favourites,
  );

  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const isInWatchlist = watchlistIds.includes(movieId);
  const isInFavourites = favouritesIds.includes(movieId);

  const [movie, setMovie] = useState<Movie | null>(null);
  const cachedMovie = useSelector(
    (state: RootState) => state.movie.currentMovie,
  );
  const [watchProgress, setWatchProgress] = useState<{
    currentTime: number;
    duration?: number;
    playbackRate?: number;
  } | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const lastProgressRef = React.useRef({ currentTime: 0, duration: 0 });
  const saveIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(
    null,
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
      if (!isAuthenticated) return;
      try {
        await addToHistoryWatch({ movieId });
      } catch (error) {
        console.error("Error recording watch history:", error);
      }
    };
    recordWatchHistory();
  }, [movieId, isAuthenticated]);

  // Lấy tiến độ + cấu hình xem khi vào trang (user đăng nhập)
  useEffect(() => {
    if (!movieId || !isAuthenticated) return;
    let cancelled = false;
    getWatchProgress(movieId).then((data) => {
      if (!cancelled && data) {
        setWatchProgress({
          currentTime: data.currentTime ?? 0,
          duration: data.duration,
          playbackRate: data.playbackRate,
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [movieId, isAuthenticated]);

  // Lưu tiến độ định kỳ (mỗi 10s) và khi rời trang
  useEffect(() => {
    if (!isAuthenticated || !movieId) return;

    const saveProgress = async () => {
      const { currentTime, duration } = lastProgressRef.current;
      if (currentTime <= 0) return;
      try {
        await upsertWatchProgress({
          movie_id: movieId,
          current_time: Math.floor(currentTime),
          duration: duration > 0 ? Math.floor(duration) : undefined,
        });
      } catch (error) {
        console.error("Error saving watch progress:", error);
      }
    };

    saveIntervalRef.current = setInterval(saveProgress, 10000);

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
        saveIntervalRef.current = null;
      }
      saveProgress();
    };
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

  const handleSubmitRating = async () => {
    if (!isAuthenticated) {
      errorToast("Lỗi", "Vui lòng đăng nhập để đánh giá phim");
      return;
    }
    if (!userRating) {
      warningToast("Thiếu thông tin", "Vui lòng chọn số sao để đánh giá");
      return;
    }
    setIsSubmittingRating(true);
    try {
      await addRatingToMovie({
        movieId: Number(movieId),
        score: userRating,
      });
      successToast("Cảm ơn bạn", "Đánh giá của bạn đã được lưu");
    } catch (error: any) {
      errorToast("Lỗi", error.message || "Không thể gửi đánh giá");
    } finally {
      setIsSubmittingRating(false);
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
        <VideoPlayer
          src={videoSource || ""}
          poster={movie.backdrop_url || undefined}
          title={movie.title}
          className="w-[90vw] rounded-sm bg-black relative aspect-video max-h-[90vh] mx-auto"
          initialCurrentTime={watchProgress?.currentTime}
          initialPlaybackRate={watchProgress?.playbackRate}
          onTimeChange={(currentTime, duration) => {
            lastProgressRef.current = { currentTime, duration };
          }}
          onPause={(currentTime, duration) => {
            lastProgressRef.current = { currentTime, duration };
            if (!isAuthenticated || !movieId || currentTime <= 0) return;
            upsertWatchProgress({
              movie_id: movieId,
              current_time: Math.floor(currentTime),
              duration: duration > 0 ? Math.floor(duration) : undefined,
            }).catch((err) =>
              console.error("Error saving progress on pause:", err),
            );
          }}
          onPlaybackRateChange={(playbackRate) => {
            if (!isAuthenticated || !movieId) return;
            upsertWatchProgress({
              movie_id: movieId,
              playback_rate: playbackRate,
            }).catch((err) =>
              console.error("Error saving playback rate:", err),
            );
          }}
        />

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
          <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
            {/* Left: thông tin phim + bình luận (lấp khoảng trống) */}
            <div className="flex-1 flex flex-col gap-8 min-w-0">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Poster */}
                <div className="w-32 md:w-48 flex-shrink-0 mx-auto sm:mx-0">
                  <img
                    src={movie.poster_url || ""}
                    alt={movie.title}
                    className="w-full rounded-lg shadow-2xl object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
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

              <div className="w-full border-t border-white/10 pt-6 mt-2">
                <MovieComments movieId={movieId} />
              </div>
            </div>

            {/* Right: đánh giá → diễn viên → gợi ý (rút gọn) */}
            <div className="w-full lg:w-80 space-y-6">
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
                <div
                  className="flex items-center justify-center gap-1 mb-3"
                  onMouseLeave={() => setHoverRating(null)}
                >
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active =
                      (hoverRating ?? userRating ?? 0) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        className="p-1"
                        onMouseEnter={() => setHoverRating(star)}
                        onClick={() => setUserRating(star)}
                      >
                        <FaStar
                          className={
                            active
                              ? "text-yellow-400 text-2xl"
                              : "text-gray-600 text-2xl"
                          }
                        />
                      </button>
                    );
                  })}
                </div>
                {userRating && (
                  <p className="text-xs text-center text-gray-300 mb-2">
                    Bạn chọn {userRating} / 5 sao
                  </p>
                )}
                <Button
                  fullWidth
                  color="primary"
                  className="font-bold"
                  onPress={handleSubmitRating}
                  isLoading={isSubmittingRating}
                >
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

              <div className="bg-white/5 rounded-xl p-4">
                <SimilarMoviesSection
                  movieId={movieId}
                  title="Phim gợi ý cho bạn"
                  layout="vertical"
                  maxItems={5}
                  className="py-2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default WatchMoviePage;
