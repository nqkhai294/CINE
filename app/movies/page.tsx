"use client";
// Movies Page (/all movies)

import { useState, useEffect, useRef, useMemo } from "react";
import { getMovies } from "@/api/api";
import { Movie } from "@/types";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import { Image } from "@heroui/image";
import { Input } from "@heroui/input";
import { AnimatePresence } from "framer-motion";
import { MovieHoverCard } from "@/components/home/movie-hover-card";
import { FiSearch, FiX, FiFilm } from "react-icons/fi";

const MovieCard = ({ movie }: { movie: Movie }) => {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(false);
  };

  return (
    <div
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800/50 cursor-pointer">
        <Image
          removeWrapper
          src={movie.poster_url}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-2">
            <p className="text-white font-medium text-xs line-clamp-2 mb-1">
              {movie.title}
            </p>
          </div>
        </div>
        {/* Rating badge */}
        {movie.avg_rating > 0 && (
          <div className="absolute top-2 right-2 bg-yellow-500/90 text-black text-xs font-bold px-1.5 py-0.5 rounded">
            ★ {movie.avg_rating.toFixed(1)}
          </div>
        )}
      </div>
      <div className="p-2">
        <p className="text-white text-xs font-medium line-clamp-1">
          {movie.title}
        </p>
      </div>

      {/* Hover Card */}
      <AnimatePresence>
        {isHovered && (
          <MovieHoverCard
            movie={movie}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter movies based on search query
  const filteredMovies = useMemo(() => {
    if (!searchQuery.trim()) return movies;

    const query = searchQuery.toLowerCase().trim();
    return movies.filter((movie) => movie.title.toLowerCase().includes(query));
  }, [movies, searchQuery]);

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      setError("");

      try {
        const moviesData = await getMovies();
        if (moviesData && Array.isArray(moviesData)) {
          setMovies(moviesData);
        } else {
          setMovies([]);
        }
      } catch (err: any) {
        console.error("Error fetching movies:", err);
        setError(err.message || "Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center pt-24">
        <Spinner size="lg" color="warning" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center pt-24">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <p className="text-gray-400">Vui lòng thử lại sau</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <FiFilm className="text-yellow-500 text-3xl" />
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Tất cả phim
              </h1>
              {movies.length > 0 && (
                <Chip
                  size="lg"
                  variant="flat"
                  color="warning"
                  className="text-white"
                >
                  {movies.length} phim
                </Chip>
              )}
            </div>

            {/* Search Bar */}
            <div className="w-full sm:w-[350px]">
              <Input
                aria-label="Tìm kiếm phim"
                classNames={{
                  inputWrapper:
                    "bg-[#1a2332] border-gray-700 hover:border-gray-600 focus-within:border-yellow-500 transition-all",
                  input: "text-sm text-white placeholder:text-gray-500",
                }}
                placeholder="Tìm kiếm phim theo tên..."
                startContent={
                  <FiSearch className="text-lg text-gray-500 flex-shrink-0" />
                }
                endContent={
                  searchQuery ? (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="p-1 hover:bg-white/10 rounded-full transition-colors"
                      type="button"
                    >
                      <FiX className="text-gray-500 hover:text-white" />
                    </button>
                  ) : null
                }
                type="search"
                variant="bordered"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <p className="text-gray-400 text-sm">
            Khám phá kho phim đa dạng với hàng ngàn bộ phim hấp dẫn
            {searchQuery && filteredMovies.length !== movies.length && (
              <span className="text-yellow-500 ml-2">
                • Đang hiển thị {filteredMovies.length} / {movies.length} phim
              </span>
            )}
          </p>
        </div>

        {/* Movies Grid */}
        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : searchQuery ? (
          <div className="text-center py-20">
            <FiSearch className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">
              Không tìm thấy phim nào với từ khóa "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="text-yellow-500 hover:text-yellow-400 text-sm underline"
            >
              Xóa bộ lọc để xem tất cả phim
            </button>
          </div>
        ) : (
          <div className="text-center py-20">
            <FiFilm className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              Chưa có phim nào trong hệ thống
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
