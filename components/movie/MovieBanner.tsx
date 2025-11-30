import { Movie } from "@/types";
import React from "react";

interface MovieBannerProps {
  backdrop: string;
}

const MovieBanner = ({ backdrop }: MovieBannerProps) => {
  return (
    <div className="relative h-[540px] w-full -mt-32 mb-8">
      {/* Background Image*/}
      <div
        className="absolute inset-0 bg-cover bg-top"
        style={{ backgroundImage: `url(${backdrop})` }}
      ></div>
      {/* Overlay*/}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black"></div>
    </div>
  );
};

export default MovieBanner;
