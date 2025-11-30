"use client";

import React, { useState } from "react";
import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalBody } from "@heroui/modal";
import { FiPlay, FiHeart, FiPlus, FiShare2, FiMessageCircle } from "react-icons/fi";

interface MovieActionsProps {
  movieId?: string;
  trailerUrl?: string;
  avgRating?: number;
}

const MovieActions = ({ movieId = "", trailerUrl, avgRating }: MovieActionsProps) => {
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return "";
    const videoId = url.split("v=")[1] || url.split("/").pop();
    return `https://www.youtube.com/embed/${videoId}`;
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
        <Button
          isIconOnly
          className="bg-[#2a3544] hover:bg-[#364152] h-11 w-11 rounded-full transition-all"
          size="md"
        >
          <FiHeart className="text-lg text-white" />
        </Button>
        
        <Button
          isIconOnly
          className="bg-[#2a3544] hover:bg-[#364152] h-11 w-11 rounded-full transition-all"
          size="md"
        >
          <FiPlus className="text-lg text-white" />
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
