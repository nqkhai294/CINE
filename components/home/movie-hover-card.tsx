"use client";

import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Image } from "@heroui/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Movie } from "@/types";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
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
import { errorToast, successToast, warningToast } from "../ui/toast";
import { FiHeart, FiPlus } from "react-icons/fi";

interface MovieHoverCardProps {
  movie: Movie;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const MovieHoverCard = ({
  movie,
  onMouseEnter,
  onMouseLeave,
}: MovieHoverCardProps) => {
  const router = useRouter();

  const [isAddingToWatchlist, setIsAddingToWatchlist] = useState(false);
  const [isAddingToFavourites, setIsAddingToFavourites] = useState(false);

  const dispatch = useAppDispatch();

  const { movieIds: watchlistIds } = useAppSelector((state) => state.watchlist);
  const { movieIds: favouritesIds } = useAppSelector(
    (state) => state.favourites
  );
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const isInWatchlist = watchlistIds.includes(movie.id);
  const isInFavourites = favouritesIds.includes(movie.id);

  const handleWatchNow = () => {
    router.push(`/movie/${movie.id}`);
  };

  const handleWatchlistToggle = async () => {
    if (!isAuthenticated) {
      errorToast("Lỗi", "Vui lòng đăng nhập để thêm vào danh sách");
      return;
    }

    setIsAddingToWatchlist(true);
    try {
      if (isInWatchlist) {
        await removeFromWatchlist(movie.id);
        dispatch(removeFromWatchlistAction(movie.id));
        warningToast("Đã xóa", "Đã xóa khỏi danh sách xem sau");
      } else {
        await addToWatchlist(movie.id);
        dispatch(addToWatchlistAction(movie.id));
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
      errorToast("Lỗi", "Vui lòng đăng nhập để thích phim");
      return;
    }

    setIsAddingToFavourites(true);
    try {
      if (isInFavourites) {
        await removeFromFavouritesList(movie.id);
        dispatch(removeFromFavouritesAction(movie.id));
        warningToast("Đã xóa", "Đã xóa khỏi danh sách yêu thích");
      } else {
        await addToFavouritesList(movie.id);
        dispatch(addToFavouritesAction(movie.id));
        successToast("Thành công", "Đã thêm vào danh sách yêu thích");
      }
    } catch (error: any) {
      errorToast("Lỗi", error.message || "Có lỗi xảy ra");
    } finally {
      setIsAddingToFavourites(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-[320px] z-50 bg-[#1a2332] rounded-large shadow-2xl border border-gray-700 overflow-hidden"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Movie Poster */}
      <div className="relative h-[180px] w-full">
        <Image
          removeWrapper
          src={movie.backdrop_url}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a2332] via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Movie Title */}
        <h4 className="text-white font-bold text-lg mb-1 line-clamp-2">
          {movie.title}
        </h4>
        <p className="text-warning text-sm mb-3">{movie.original_title}</p>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-3">
          <Button
            size="sm"
            color="warning"
            className="flex-1 font-medium text-xs"
            onPress={handleWatchNow}
            startContent={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            }
          >
            Xem ngay
          </Button>
          <Button
            size="sm"
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
            size="sm"
            variant="bordered"
            isIconOnly
            className={`${
              isInWatchlist
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-[#2a3544] hover:bg-[#364152]"
            } text-white`}
            onPress={handleWatchlistToggle}
            isLoading={isAddingToWatchlist}
          >
            <FiPlus
              className={`text-lg ${isInWatchlist ? "text-black" : "text-white"}`}
            />
          </Button>
        </div>

        {/* Movie Info */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-300 mb-3">
          <Chip
            size="sm"
            className="bg-warning/20 text-warning font-semibold text-[10px] rounded-2xl"
          >
            IMDb {movie.tmdb_vote_average}
          </Chip>
          <Chip
            size="sm"
            variant="bordered"
            className="border-gray-600 text-white text-[10px]"
          >
            4K
          </Chip>
          <Chip
            size="sm"
            variant="bordered"
            className="border-gray-600 text-white text-[10px]"
          >
            T18
          </Chip>
          <span>{movie.release_year}</span>
          <span>•</span>
          <span>
            {movie.runtime
              ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
              : "N/A"}
          </span>
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-1.5">
          {movie.genres.slice(0, 4).map((genre) => (
            <span
              key={genre}
              className="px-2 py-1 bg-white/5 rounded text-[11px] text-gray-300"
            >
              {genre || "Khác"}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
