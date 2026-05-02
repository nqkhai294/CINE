"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@heroui/input";
import { searchMovies } from "@/api/api";
import { Movie } from "@/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiSearch, FiX, FiTrendingUp } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const NAVBAR_SEARCH_LIMIT = 20;

interface SearchBarProps {
  /** Placeholder text cho input */
  placeholder?: string;
  /** Variant style: "navbar" cho thanh điều hướng, "page" cho trong trang */
  variant?: "navbar" | "page";
  /** Class name tùy chỉnh cho container */
  className?: string;
  /** Chiều rộng dropdown (mặc định: 420px cho navbar, 100% cho page) */
  dropdownWidth?: string;
  /** Hiển thị icon clear khi có text */
  showClearButton?: boolean;
  /** Callback khi chọn một phim */
  onMovieSelect?: (movie: Movie) => void;
  /** Auto focus khi mount */
  autoFocus?: boolean;
}

export const SearchBar = ({
  placeholder = "Tìm kiếm phim, diễn viên...",
  variant = "navbar",
  className = "",
  dropdownWidth,
  showClearButton = true,
  onMovieSelect,
  autoFocus = false,
}: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searchMeta, setSearchMeta] = useState({
    page: 1,
    totalPages: 0,
    total: 0,
  });
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const scrollListRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryRef = useRef("");
  const searchMetaRef = useRef(searchMeta);
  const loadingMoreLockRef = useRef(false);
  const router = useRouter();

  queryRef.current = searchQuery.trim();
  searchMetaRef.current = searchMeta;

  // Debounce search — trang 1
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchMeta({ page: 1, totalPages: 0, total: 0 });
      setShowDropdown(false);
      setSelectedIndex(-1);
      loadingMoreLockRef.current = false;
      return;
    }

    const kw = searchQuery.trim();
    const timer = setTimeout(async () => {
      setIsSearching(true);
      loadingMoreLockRef.current = false;
      try {
        const res = await searchMovies(kw, {
          page: 1,
          limit: NAVBAR_SEARCH_LIMIT,
        });
        if (queryRef.current !== kw) return;
        setSearchResults(res.data);
        setSearchMeta({
          page: res.pagination.page,
          totalPages: res.pagination.totalPages,
          total: res.pagination.total,
        });
        setShowDropdown(true);
        setSelectedIndex(-1);
        scrollListRef.current?.scrollTo({ top: 0 });
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleMovieClick = useCallback(
    (movie: Movie) => {
      setShowDropdown(false);
      setSearchQuery("");
      setSelectedIndex(-1);
      if (onMovieSelect) {
        onMovieSelect(movie);
      } else {
        router.push(`/movie/${movie.id}`);
      }
    },
    [onMovieSelect, router],
  );

  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || isSearching || loadingMoreLockRef.current) return;
    const kw = searchQuery.trim();
    if (!kw) return;

    const meta = searchMetaRef.current;
    if (meta.page >= meta.totalPages || meta.totalPages === 0) return;

    const nextPage = meta.page + 1;
    loadingMoreLockRef.current = true;
    setIsLoadingMore(true);

    searchMovies(kw, { page: nextPage, limit: NAVBAR_SEARCH_LIMIT })
      .then((res) => {
        if (queryRef.current !== kw) return;
        setSearchResults((prev) => [...prev, ...res.data]);
        setSearchMeta((m) => ({ ...m, page: nextPage }));
      })
      .catch((e) => console.error("Load more search:", e))
      .finally(() => {
        loadingMoreLockRef.current = false;
        setIsLoadingMore(false);
      });
  }, [searchQuery, isLoadingMore, isSearching]);

  const handleResultsScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      const threshold = 72;
      if (
        el.scrollHeight - el.scrollTop - el.clientHeight >
        threshold
      ) {
        return;
      }
      handleLoadMore();
    },
    [handleLoadMore],
  );

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

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showDropdown || searchResults.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < searchResults.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : searchResults.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && searchResults[selectedIndex]) {
            handleMovieClick(searchResults[selectedIndex]);
          }
          break;
        case "Escape":
          setShowDropdown(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    },
    [showDropdown, searchResults, selectedIndex, handleMovieClick],
  );

  const handleClear = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchMeta({ page: 1, totalPages: 0, total: 0 });
    setShowDropdown(false);
    setSelectedIndex(-1);
    loadingMoreLockRef.current = false;
    inputRef.current?.focus();
  };

  // Styles based on variant
  const inputWrapperClass =
    variant === "navbar"
      ? "bg-black/30 border-white/20 hover:border-white/40 focus-within:border-yellow-500/50"
      : "bg-[#1a2332] border-gray-700 hover:border-gray-600 focus-within:border-yellow-500";

  const inputClass =
    variant === "navbar"
      ? "text-sm text-white placeholder:text-white/60"
      : "text-base text-white placeholder:text-gray-500";

  const computedDropdownWidth =
    dropdownWidth || (variant === "navbar" ? "420px" : "100%");

  return (
    <div ref={searchRef} className={`relative w-full ${className}`}>
      <Input
        ref={inputRef}
        aria-label="Search"
        classNames={{
          inputWrapper: `${inputWrapperClass} transition-all duration-200`,
          input: inputClass,
        }}
        labelPlacement="outside"
        placeholder={placeholder}
        startContent={
          <FiSearch className="text-lg text-white/60 pointer-events-none flex-shrink-0" />
        }
        endContent={
          showClearButton && searchQuery ? (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
              type="button"
            >
              <FiX className="text-white/60 hover:text-white" />
            </button>
          ) : null
        }
        type="search"
        variant="bordered"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
        onKeyDown={handleKeyDown}
        autoFocus={autoFocus}
        size={variant === "page" ? "lg" : "md"}
      />

      {/* Dropdown Results */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 bg-[#1a2332] rounded-xl shadow-2xl border border-gray-700/50 max-h-[400px] overflow-hidden z-50"
            style={{ width: computedDropdownWidth }}
          >
            {isSearching ? (
              <div className="p-6 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-yellow-500 border-t-transparent"></div>
                <p className="text-gray-400 text-sm mt-3">Đang tìm kiếm...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div
                ref={scrollListRef}
                onScroll={handleResultsScroll}
                className="overflow-y-auto max-h-[380px]"
              >
                {/* Header */}
                <div className="px-4 py-2 border-b border-gray-700/50 flex items-center gap-2 flex-wrap">
                  <FiTrendingUp className="text-yellow-500" />
                  <span className="text-xs text-gray-400 font-medium">
                    Tìm thấy {searchMeta.total} kết quả
                    {searchMeta.total > searchResults.length && (
                      <span className="text-gray-500">
                        {" "}
                        · Đang hiện {searchResults.length}
                      </span>
                    )}
                  </span>
                </div>

                {/* Results */}
                <div className="py-1">
                  {searchResults.map((movie, index) => (
                    <button
                      key={movie.id}
                      onClick={() => handleMovieClick(movie)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-start gap-3 px-4 py-3 transition-colors text-left ${
                        selectedIndex === index
                          ? "bg-yellow-500/10"
                          : "hover:bg-gray-700/50"
                      }`}
                    >
                      {/* Poster Thumbnail */}
                      <div className="relative w-12 h-[72px] flex-shrink-0 rounded-lg overflow-hidden bg-gray-800">
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

                      {/* Movie Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium text-sm line-clamp-1 mb-1">
                          {movie.title}
                        </h4>
                        {movie.original_title &&
                          movie.original_title !== movie.title && (
                            <p className="text-gray-500 text-xs line-clamp-1 mb-1.5">
                              {movie.original_title}
                            </p>
                          )}
                        <div className="flex items-center gap-2 flex-wrap">
                          {movie.release_year && (
                            <span className="text-yellow-500 text-xs font-medium">
                              {movie.release_year}
                            </span>
                          )}
                          {movie.tmdb_vote_average != null && (
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <svg
                                className="w-3 h-3 text-yellow-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              {Number(movie.tmdb_vote_average).toFixed(1)}
                            </span>
                          )}
                          {movie.genres && movie.genres.length > 0 && (
                            <div className="flex gap-1">
                              {movie.genres.slice(0, 2).map((genre, idx) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.5 bg-gray-700/70 text-gray-400 text-[10px] rounded"
                                >
                                  {genre}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Arrow indicator */}
                      {selectedIndex === index && (
                        <div className="flex items-center self-center">
                          <svg
                            className="w-4 h-4 text-yellow-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {isLoadingMore && (
                  <div className="py-3 flex justify-center">
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-yellow-500 border-t-transparent" />
                  </div>
                )}

                {searchMeta.page >= searchMeta.totalPages &&
                  searchMeta.totalPages > 0 &&
                  searchResults.length > 0 &&
                  !isLoadingMore && (
                    <p className="text-center text-[11px] text-gray-500 py-2">
                      Đã hiển thị toàn bộ {searchMeta.total} kết quả
                    </p>
                  )}

                {/* Footer hint */}
                <div className="px-4 py-2 border-t border-gray-700/50 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-[10px]">
                      ↑↓
                    </kbd>
                    <span>để chọn</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-[10px]">
                      Enter
                    </kbd>
                    <span>để xem</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-[10px]">
                      Esc
                    </kbd>
                    <span>để đóng</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center">
                <FiSearch className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">
                  Không tìm thấy kết quả cho "{searchQuery}"
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Thử tìm với từ khóa khác
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

