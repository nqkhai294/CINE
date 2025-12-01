"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@heroui/input";
import { SearchIcon } from "@/components/icons";
import { searchMovies } from "@/api/api";
import { Movie } from "@/types";
import Image from "next/image";
import { useRouter } from "next/navigation";

export const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounce search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchMovies(searchQuery);
        setSearchResults(results);
        setShowDropdown(true);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMovieClick = (movieId: string) => {
    setShowDropdown(false);
    setSearchQuery("");
    router.push(`/movie/${movieId}`);
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <Input
        aria-label="Search"
        classNames={{
          inputWrapper: "bg-black/30 border-white/20",
          input: "text-sm text-white placeholder:text-white/60",
        }}
        labelPlacement="outside"
        placeholder="Tìm kiếm phim, diễn viên"
        startContent={
          <SearchIcon className="text-sm text-white/60 pointer-events-none flex-shrink-0" />
        }
        type="search"
        variant="bordered"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
      />

      {/* Dropdown Results - Fixed width, independent of search bar */}
      {showDropdown && (
        <div className="absolute top-full left-0 mt-2 w-[420px] bg-[#1a2332] rounded-lg shadow-2xl border border-gray-700 max-h-[400px] overflow-y-auto z-50">
          {isSearching ? (
            <div className="p-3 text-center">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500"></div>
              <p className="text-gray-400 text-xs mt-2">Đang tìm kiếm...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="py-1">
              {searchResults.map((movie) => (
                <button
                  key={movie.id}
                  onClick={() => handleMovieClick(movie.id)}
                  className="w-full flex items-start gap-3 px-3 py-2 hover:bg-gray-700/50 transition-colors text-left"
                >
                  {/* Poster Thumbnail - Left */}
                  <div className="relative w-12 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-800">
                    {movie.poster_url ? (
                      <Image
                        src={movie.poster_url}
                        alt={movie.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Movie Info - Right */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium text-sm line-clamp-1 mb-1.5">
                      {movie.title}
                    </h4>
                    {/* Genre Tags */}
                    {movie.genres && movie.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {movie.genres.slice(0, 3).map((genre, index) => (
                          <span
                            key={index}
                            className="px-1.5 py-0.5 bg-gray-700/70 text-gray-400 text-xs rounded"
                          >
                            {genre}
                          </span>
                        ))}
                        {movie.genres.length > 3 && (
                          <span className="text-gray-500 text-xs">
                            +{movie.genres.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-3 text-center">
              <p className="text-gray-400 text-xs">
                Không tìm thấy kết quả cho "{searchQuery}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

