"use client";

import React from "react";
import { Tabs, Tab } from "@heroui/tabs";
import Image from "next/image";
import Link from "next/link";
import { Actor } from "@/types";
import SimilarMoviesSection from "./SimilarMoviesSection";

interface MovieTabsProps {
  movieId?: string;
  actors?: Actor[];
}

const MovieTabs = ({ movieId = "", actors }: MovieTabsProps) => {
  return (
    <div className="w-full">
      <Tabs
        aria-label="Movie tabs"
        color="warning"
        variant="underlined"
        defaultSelectedKey="recommended"
        classNames={{
          tabList:
            "gap-8 w-full relative rounded-none p-0 border-b border-gray-800",
          cursor: "w-full bg-yellow-500",
          tab: "max-w-fit px-0 h-12",
          tabContent:
            "group-data-[selected=true]:text-yellow-500 text-gray-400 font-medium text-sm",
        }}
      >
        <Tab key="recommended" title="Gợi ý cho bạn">
          <SimilarMoviesSection
            movieId={movieId}
            title="Phim gợi ý cho bạn"
          />
        </Tab>

        <Tab key="cast" title="Diễn viên">
          <div className="py-6">
            {actors && actors.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {actors.map((actor) => (
                  <Link
                    key={actor.id}
                    href={`/actor/${actor.id}`}
                    className="flex flex-col items-center group cursor-pointer"
                  >
                    {actor.profile_url ? (
                      <div className="relative w-24 h-24 rounded-full overflow-hidden mb-3 ring-2 ring-gray-700 group-hover:ring-yellow-500 transition-all">
                        <Image
                          src={actor.profile_url}
                          alt={actor.name}
                          fill
                          sizes="80px"
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mb-3 ring-2 ring-gray-700 group-hover:ring-yellow-500 transition-all">
                        <span className="text-gray-400 text-xl font-bold">
                          {actor.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <p className="text-white font-medium text-sm text-center line-clamp-2 w-full group-hover:text-yellow-500 transition-colors">
                      {actor.name}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">
                Chưa có thông tin diễn viên
              </p>
            )}
          </div>
        </Tab>

        <Tab key="gallery" title="Gallery">
          <div className="py-6">
            <p className="text-gray-400 text-center py-8">
              Thư viện ảnh đang được cập nhật...
            </p>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default MovieTabs;
