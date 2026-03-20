import { Movie } from "@/types";
import React from "react";

interface MovieBannerProps {
  backdrop: string;
}

const MovieBanner = ({ backdrop }: MovieBannerProps) => {
  return (
    <div className="relative w-full h-64 sm:h-80 md:h-[420px] lg:h-[520px] xl:h-[640px] -mt-16 sm:-mt-20 md:-mt-24 lg:-mt-32 mb-6 sm:mb-8">
      {/* Background Image*/}
      <div
        className="absolute inset-0 bg-cover bg-center lg:bg-top"
        style={{ backgroundImage: `url(${backdrop})` }}
      ></div>
      {/* Overlay*/}
      <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/30 to-black"></div>
    </div>
  );
};

export default MovieBanner;
