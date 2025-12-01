"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalBody } from "@heroui/modal";
import {
  FiPlay,
  FiHeart,
  FiPlus,
  FiShare2,
  FiMessageCircle,
} from "react-icons/fi";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  addToWatchlist as addToWatchlistAction,
  removeFromWatchlist as removeFromWatchlistAction,
} from "@/store/slices/watchlistSlice";
import {
  addToFavouritesList as addToFavouritesAction,
  removeFromFavouritesList as removeFromFavouritesAction,
} from "@/store/slices/favouritesSlice";
import {
  addToWatchlist,
  removeFromWatchlist,
  addToFavouritesList,
  removeFromFavouritesList,
} from "@/api/api";
import { successToast, errorToast, warningToast } from "@/components/ui/toast";

interface MovieActionsProps {
  movieId?: string;
  trailerUrl?: string;
  avgRating?: number;
}

const MovieActions = ({
  movieId = "",
  trailerUrl,
  avgRating,
}: MovieActionsProps) => {
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isAddingToWatchlist, setIsAddingToWatchlist] = useState(false);
  const [isAddingToFavourites, setIsAddingToFavourites] = useState(false);

  const dispatch = useAppDispatch();
  const { movieIds: watchlistIds } = useAppSelector((state) => state.watchlist);
  const { movieIds: favouritesIds } = useAppSelector(
    (state) => state.favourites
  );
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const isInWatchlist = watchlistIds.includes(movieId);
  const isInFavourites = favouritesIds.includes(movieId);

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return "";
    const videoId = url.split("v=")[1] || url.split("/").pop();
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const handleWatchlistToggle = async () => {
    if (!isAuthenticated) {
      errorToast("Lỗi", "Vui lòng đăng nhập để thêm vào danh sách");
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
      errorToast("Lỗi", "Vui lòng đăng nhập để thích phim");
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

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        {/* Watch Now Button */}
        <Button
          size="md"
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold h-11 px-7 rounded-full transition-all text-sm"
          startContent={<FiPlay className="text-base" />}
        >
          Xem Ngay
        </Button>

        {/* Watch Trailer Button */}
        {trailerUrl && (
          <Button
            size="md"
            className="bg-[#2a3544] hover:bg-[#364152] text-white font-medium h-11 px-6 rounded-full transition-all text-sm"
            startContent={<FiPlay className="text-base" />}
            onPress={() => setIsTrailerOpen(true)}
          >
            Xem Trailer
          </Button>
        )}

        {/* Action Buttons - Dark circular style */}
        {/* Like Button */}
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
          isIconOnly
          className="bg-[#2a3544] hover:bg-[#364152] h-11 w-11 rounded-full transition-all"
          size="md"
        >
          <FiShare2 className="text-lg text-white" />
        </Button>

        <Button
          isIconOnly
          className="bg-[#2a3544] hover:bg-[#364152] h-11 w-11 rounded-full transition-all"
          size="md"
        >
          <FiMessageCircle className="text-lg text-white" />
        </Button>
      </div>

      {/* Trailer Modal */}
      <Modal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        size="5xl"
        classNames={{
          base: "bg-black",
          closeButton: "hover:bg-white/10 text-white text-xl",
        }}
      >
        <ModalContent>
          <ModalBody className="p-0">
            <div className="relative pt-[56.25%]">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={trailerUrl ? getYoutubeEmbedUrl(trailerUrl) : ""}
                title="Movie Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default MovieActions;
