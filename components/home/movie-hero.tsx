"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Movie } from "@/types";
import { GENRE_MAP } from "@/config/constants";
import { useRouter } from "next/navigation";
import { FiHeart, FiPlus } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { errorToast, successToast, warningToast } from "../ui/toast";
import {
  addToFavouritesList,
  addToWatchlist,
  removeFromFavouritesList,
  removeFromWatchlist,
} from "@/api/api";
import {
  addToWatchlist as addToWatchlistAction,
  removeFromWatchlist as removeFromWatchlistAction,
} from "@/store/slices/watchlistSlice";
import {
  addToFavouritesList as addToFavouritesAction,
  removeFromFavouritesList as removeFromFavouritesAction,
} from "@/store/slices/favouritesSlice";

interface MovieHeroProps {
  movies: Movie[];
}

export const MovieHero = ({ movies }: MovieHeroProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAddingToWatchlist, setIsAddingToWatchlist] = useState(false);
  const [isAddingToFavourites, setIsAddingToFavourites] = useState(false);

  const dispatch = useAppDispatch();
  const { movieIds: watchlistIds } = useAppSelector((state) => state.watchlist);
  const { movieIds: favouritesIds } = useAppSelector(
    (state) => state.favourites
  );
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const isInWatchlist = watchlistIds.includes(movies[currentIndex].id);
  const isInFavourites = favouritesIds.includes(movies[currentIndex].id);

  const currentMovie = movies[currentIndex];

  const router = useRouter();

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  const handleWatchlistToggle = async () => {
    if (!isAuthenticated) {
      warningToast("Warning", "Vui lòng đăng nhập để sử dụng tính năng này.");
      return;
    }

    setIsAddingToWatchlist(true);
    try {
      if (isInWatchlist) {
        // Remove from watchlist
        await removeFromWatchlist(currentMovie.id);
        dispatch(removeFromWatchlistAction(currentMovie.id));
        warningToast("Đã xóa", "Phim đã được xóa khỏi danh sách xem sau.");
      } else {
        // Add to watchlist
        await addToWatchlist(currentMovie.id);
        dispatch(addToWatchlistAction(currentMovie.id));
        successToast("Đã thêm", "Phim đã được thêm vào danh sách xem sau.");
      }
    } catch (error: any) {
      errorToast("Lỗi", error.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsAddingToWatchlist(false);
    }
  };

  const handleFavouritesToggle = async () => {
    if (!isAuthenticated) {
      warningToast("Warning", "Vui lòng đăng nhập để sử dụng tính năng này.");
      return;
    }

    setIsAddingToFavourites(true);
    try {
      if (isInFavourites) {
        // Remove from favourites
        await removeFromFavouritesList(currentMovie.id);
        dispatch(removeFromFavouritesAction(currentMovie.id));
        warningToast("Đã xóa", "Phim đã được xóa khỏi danh sách yêu thích.");
      } else {
        await addToFavouritesList(currentMovie.id);
        dispatch(addToFavouritesAction(currentMovie.id));
        successToast("Đã thêm", "Phim đã được thêm vào danh sách yêu thích.");
      }
    } catch (error: any) {
      errorToast("Lỗi", error.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsAddingToFavourites(false);
    }
  };

  const onNavigateDetailFilm = (id: string) => {
    router.push(`/movie/${id}`);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Image with Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMovie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${currentMovie.backdrop_url})`,
            }}
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end pb-32 px-6 md:px-12 lg:px-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMovie.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 uppercase tracking-wide">
              {currentMovie.title}
            </h1>

            {/* Movie Info */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Chip
                color="warning"
                size="sm"
                className="font-semibold text-xs rounded-md"
                startContent={<span className="text-xs mr-1">IMDb</span>}
              >
                {currentMovie.tmdb_vote_average}
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
                {currentMovie.release_year}
              </Chip>
              <Chip
                size="sm"
                variant="bordered"
                className="text-white border-white/50 text-xs rounded-md"
              >
                {currentMovie.runtime
                  ? `${Math.floor(currentMovie.runtime / 60)}h ${currentMovie.runtime % 60}m`
                  : "N/A"}
              </Chip>
            </div>

            {/* Genre Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {currentMovie.genres.map((genre) => (
                <span
                  key={genre}
                  className="px-2 py-0.5 bg-white/10 backdrop-blur-sm rounded-full text-xs text-white"
                >
                  {genre || "Khác"}
                </span>
              ))}
            </div>

            {/* Description */}
            <p className="text-white/90 text-sm md:text-base mb-6 line-clamp-3 max-w-2xl">
              {currentMovie.summary}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                size="md"
                color="warning"
                className="font-medium text-base px-6"
                startContent={
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                }
                onPress={() => onNavigateDetailFilm(currentMovie.id)}
              >
                Xem Phim
              </Button>
              <Button
                size="md"
                variant="bordered"
                isIconOnly
                className={`${
                  isInFavourites
                    ? "bg-red-500 hover:bg-red-600 border-red-500"
                    : "border-gray-600 hover:bg-white/10"
                } text-white`}
                onPress={handleFavouritesToggle}
                isLoading={isAddingToFavourites}
              >
                <FiHeart className="text-lg" />
              </Button>
              <Button
                size="md"
                variant="bordered"
                isIconOnly
                className={`${
                  isInWatchlist
                    ? "bg-yellow-500 hover:bg-yellow-600 border-yellow-500"
                    : "border-gray-600 hover:bg-white/10"
                } text-white`}
                onPress={handleWatchlistToggle}
                isLoading={isAddingToWatchlist}
              >
                <FiPlus className="text-lg" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Thumbnails Carousel */}
        <div className="absolute bottom-12 right-6 flex gap-2">
          {movies.map((movie, index) => (
            <motion.button
              key={movie.id}
              onClick={() => handleThumbnailClick(index)}
              className={clsx(
                "relative flex-shrink-0 w-20 h-12 rounded overflow-hidden transition-all duration-300 border-2",
                currentIndex === index
                  ? "border-warning shadow-lg shadow-warning/50"
                  : "border-transparent hover:border-white/50 opacity-70 hover:opacity-100"
              )}
              whileHover={{ scale: currentIndex === index ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src={movie.backdrop_url}
                alt={movie.title}
                className="w-full h-full object-cover object-center"
              />
              {currentIndex === index && (
                <div className="absolute inset-0 bg-gradient-to-t from-warning/30 to-transparent" />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
