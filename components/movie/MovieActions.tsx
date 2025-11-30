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
      <div className="flex flex-wrap items-center gap-4">
        {/* Watch Now Button */}
        <Button
          size="lg"
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold h-14 px-10 rounded-full transition-all"
          startContent={<FiPlay className="text-xl" />}
        >
          Xem Ngay
        </Button>

        {/* Action Buttons - Dark circular style */}
        <Button
          isIconOnly
          className="bg-[#2a3544] hover:bg-[#364152] h-14 w-14 rounded-full transition-all"
          size="lg"
        >
          <FiHeart className="text-xl text-white" />
        </Button>
        
        <Button
          isIconOnly
          className="bg-[#2a3544] hover:bg-[#364152] h-14 w-14 rounded-full transition-all"
          size="lg"
        >
          <FiPlus className="text-xl text-white" />
        </Button>
        
        <Button
          isIconOnly
          className="bg-[#2a3544] hover:bg-[#364152] h-14 w-14 rounded-full transition-all"
          size="lg"
        >
          <FiShare2 className="text-xl text-white" />
        </Button>
        
        <Button
          isIconOnly
          className="bg-[#2a3544] hover:bg-[#364152] h-14 w-14 rounded-full transition-all"
          size="lg"
        >
          <FiMessageCircle className="text-xl text-white" />
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
