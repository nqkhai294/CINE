"use client";

import { useState, useEffect, useMemo } from "react";
import { getAllActors } from "@/api/api";
import { Actor } from "@/types";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { Avatar } from "@heroui/avatar";
import { FiSearch, FiX, FiUsers } from "react-icons/fi";
import Link from "next/link";
import { motion } from "framer-motion";

const ActorCard = ({ actor, index }: { actor: Actor; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.02 }}
    >
      <Link
        href={`/actor/${actor.id}`}
        className="group flex flex-col items-center p-4 rounded-xl bg-[#1a2332]/50 hover:bg-[#1a2332] transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10"
      >
        <div className="relative mb-3">
          <Avatar
            src={actor.profile_url || undefined}
            name={actor.name}
            className="w-24 h-24 text-large ring-2 ring-gray-700 group-hover:ring-yellow-500 transition-all duration-300"
            showFallback
            fallback={
              <span className="text-2xl font-bold text-gray-400">
                {actor.name.charAt(0).toUpperCase()}
              </span>
            }
          />
          <div className="absolute inset-0 rounded-full bg-yellow-500/0 group-hover:bg-yellow-500/10 transition-all duration-300" />
        </div>
        <p className="text-white text-sm font-medium text-center line-clamp-2 group-hover:text-yellow-500 transition-colors">
          {actor.name}
        </p>
      </Link>
    </motion.div>
  );
};

export default function ActorsPage() {
  const [actors, setActors] = useState<Actor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter actors based on search query
  const filteredActors = useMemo(() => {
    if (!searchQuery.trim()) return actors;

    const query = searchQuery.toLowerCase().trim();
    return actors.filter((actor) =>
      actor.name.toLowerCase().includes(query)
    );
  }, [actors, searchQuery]);

  useEffect(() => {
    const fetchActors = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await getAllActors();
        if (response && response.data) {
          setActors(response.data);
        } else if (Array.isArray(response)) {
          setActors(response);
        } else {
          setActors([]);
        }
      } catch (err: any) {
        console.error("Error fetching actors:", err);
        setError(err.message || "Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setIsLoading(false);
      }
    };

    fetchActors();
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
              <FiUsers className="text-yellow-500 text-3xl" />
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Diễn viên
              </h1>
              {actors.length > 0 && (
                <Chip
                  size="lg"
                  variant="flat"
                  color="warning"
                  className="text-white"
                >
                  {actors.length} diễn viên
                </Chip>
              )}
            </div>

            {/* Search Bar */}
            <div className="w-full sm:w-[350px]">
              <Input
                aria-label="Tìm kiếm diễn viên"
                classNames={{
                  inputWrapper:
                    "bg-[#1a2332] border-gray-700 hover:border-gray-600 focus-within:border-yellow-500 transition-all",
                  input: "text-sm text-white placeholder:text-gray-500",
                }}
                placeholder="Tìm kiếm diễn viên theo tên..."
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
            Khám phá các diễn viên nổi tiếng và các bộ phim họ tham gia
            {searchQuery && filteredActors.length !== actors.length && (
              <span className="text-yellow-500 ml-2">
                • Đang hiển thị {filteredActors.length} / {actors.length} diễn viên
              </span>
            )}
          </p>
        </div>

        {/* Actors Grid */}
        {filteredActors.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {filteredActors.map((actor, index) => (
              <ActorCard key={actor.id} actor={actor} index={index} />
            ))}
          </div>
        ) : searchQuery ? (
          <div className="text-center py-20">
            <FiSearch className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">
              Không tìm thấy diễn viên nào với từ khóa "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="text-yellow-500 hover:text-yellow-400 text-sm underline"
            >
              Xóa bộ lọc để xem tất cả diễn viên
            </button>
          </div>
        ) : (
          <div className="text-center py-20">
            <FiUsers className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              Chưa có diễn viên nào trong hệ thống
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

