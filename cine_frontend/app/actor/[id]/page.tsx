"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import { getMoviesByActor } from "@/api/api";
import { Movie, Actor } from "@/types";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import { Image } from "@heroui/image";
import { Input } from "@heroui/input";
import { Avatar } from "@heroui/avatar";
import { AnimatePresence, motion } from "framer-motion";
import { MovieHoverCard } from "@/components/home/movie-hover-card";
import { FiSearch, FiX, FiArrowLeft } from "react-icons/fi";
import Link from "next/link";

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
        {movie.release_year && (
          <p className="text-gray-400 text-xs">{movie.release_year}</p>
        )}
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

export default function ActorDetailPage() {
  const params = useParams();
  const actorId = params.id as string;

  const [movies, setMovies] = useState<Movie[]>([]);
  const [actor, setActor] = useState<Actor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter movies based on search query
  const filteredMovies = useMemo(() => {
    if (!searchQuery.trim()) return movies;

    const query = searchQuery.toLowerCase().trim();
    return movies.filter(
      (movie) =>
        movie.title.toLowerCase().includes(query) ||
        (movie.original_title && movie.original_title.toLowerCase().includes(query))
    );
  }, [movies, searchQuery]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await getMoviesByActor(actorId);
        console.log("Movies by actor response:", response);
        
        if (response) {
          // Set actor info
          if (response.actor) {
            setActor(response.actor);
          }
          
          // Set movies
          if (response.movies && Array.isArray(response.movies)) {
            setMovies(response.movies);
          } else if (response.data && Array.isArray(response.data)) {
            setMovies(response.data);
          } else {
            setMovies([]);
          }
        }
      } catch (err: any) {
        console.error("Error fetching actor data:", err);
        setError(err.message || "Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setIsLoading(false);
      }
    };

    if (actorId) {
      fetchData();
    }
  }, [actorId]);

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
        {/* Back button */}
        <Link
          href="/actors"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <FiArrowLeft />
          <span>Quay lại danh sách diễn viên</span>
        </Link>

        {/* Actor Info Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 p-6 bg-[#1a2332]/50 rounded-2xl"
        >
          <Avatar
            src={actor?.profile_url || undefined}
            name={actor?.name || "Actor"}
            className="w-32 h-32 text-3xl ring-4 ring-yellow-500/50"
            showFallback
            fallback={
              <span className="text-4xl font-bold text-gray-400">
                {actor?.name?.charAt(0).toUpperCase() || "A"}
              </span>
            }
          />
          <div className="text-center sm:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {actor?.name || "Diễn viên"}
            </h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
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
            <p className="text-gray-400 text-sm mt-3">
              Khám phá các bộ phim có sự tham gia của {actor?.name}
            </p>
          </div>
        </motion.div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-semibold text-white">
              Các phim đã tham gia
            </h2>
            <div className="w-full sm:w-[350px]">
              <Input
                aria-label="Tìm kiếm phim"
                classNames={{
                  inputWrapper:
                    "bg-[#1a2332] border-gray-700 hover:border-gray-600 focus-within:border-yellow-500 transition-all",
                  input: "text-sm text-white placeholder:text-gray-500",
                }}
                placeholder={`Tìm phim của ${actor?.name || "diễn viên"}...`}
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
          {searchQuery && filteredMovies.length !== movies.length && (
            <p className="text-yellow-500 text-sm mt-2">
              Đang hiển thị {filteredMovies.length} / {movies.length} phim
            </p>
          )}
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
            <p className="text-gray-400 text-lg">
              Chưa có thông tin về các phim của diễn viên này
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

