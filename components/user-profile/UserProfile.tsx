"use client";

import React, { useState, useEffect, useRef } from "react";
import { Avatar } from "@heroui/avatar";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import Image from "next/image";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  FiCalendar,
  FiMapPin,
  FiMail,
  FiClock,
  FiHeart,
  FiBookmark,
  FiCamera,
  FiEdit2,
  FiSave,
  FiX,
  FiTrash2,
} from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { successToast, errorToast } from "@/components/ui/toast";
import {
  getCurrentUser,
  updateUserProfile,
  getMovieDetails,
  removeFromWatchlist,
} from "@/api/api";
import { login } from "@/store/slices/authSlice";
import { removeFromWatchlist as removeFromWatchlistAction } from "@/store/slices/watchlistSlice";
import DefaultAvatar from "@/public/default_avt.png";
import ConfirmDialog from "@/components/ui/confirm-dialog";

interface Movie {
  id: string;
  title: string;
  poster_url: string;
  release_year?: number;
  tmdb_vote_average?: string;
}

const UserProfile = () => {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const { movieIds: watchlistIds } = useAppSelector((state) => state.watchlist);

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [bio, setBio] = useState(user?.bio || "");
  const [dateOfBirth, setDateOfBirth] = useState(user?.date_of_birth || "");
  const [gender, setGender] = useState<string>(user?.gender || "");

  // Sync state với user data từ Redux khi có thay đổi
  useEffect(() => {
    if (user) {
      setBio(user.bio || "");
      setDateOfBirth(user.date_of_birth || "");
      setGender(user.gender || "");
    }
  }, [user]);

  // Mock data - sẽ thay bằng API call thực tế
  const [recentMovies, setRecentMovies] = useState<Movie[]>([]);
  const [likedMovies, setLikedMovies] = useState<Movie[]>([]);
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingUser, setIsFetchingUser] = useState(false);

  // Confirm dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const genderOptions = [
    { value: "male", label: "Nam" },
    { value: "female", label: "Nữ" },
    { value: "other", label: "Khác" },
  ];

  useEffect(() => {
    // Fetch current user data from API
    const fetchUserData = async () => {
      if (!user?.id) return;

      setIsFetchingUser(true);
      try {
        const response = await getCurrentUser(user.id);
        console.log("API getCurrentUser response:", response);
        if (response.data) {
          const token = localStorage.getItem("token");
          // Merge với user data hiện tại để giữ lại các field khác
          const updatedUser = {
            ...user,
            ...response.data,
          };
          console.log("Updated user:", updatedUser);
          dispatch(login({ user: updatedUser, token: token || "" }));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsFetchingUser(false);
      }
    };

    // Luôn fetch user data khi vào trang profile để có thông tin mới nhất
    if (user?.id) {
      fetchUserData();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps = chỉ chạy 1 lần khi mount

  // Fetch watchlist movies khi watchlistIds thay đổi
  useEffect(() => {
    const fetchWatchlistMovies = async () => {
      if (watchlistIds.length === 0) {
        setWatchlistMovies([]);
        return;
      }

      try {
        const moviesPromises = watchlistIds.map((id) => getMovieDetails(id));
        const moviesData = await Promise.all(moviesPromises);
        const validMovies = moviesData.filter((movie) => movie !== null);
        setWatchlistMovies(validMovies as Movie[]);
      } catch (error) {
        console.error("Error fetching watchlist movies:", error);
      }
    };

    fetchWatchlistMovies();
  }, [watchlistIds]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Prepare data to send
      const profileData: {
        bio?: string;
        avatar_url?: string;
        date_of_birth?: string;
        gender?: string;
      } = {};

      if (bio !== user?.bio) profileData.bio = bio;
      if (dateOfBirth !== user?.date_of_birth)
        profileData.date_of_birth = dateOfBirth;
      if (gender !== user?.gender) profileData.gender = gender;

      // Call API to update profile
      const response = await updateUserProfile(profileData);

      // Update Redux store with new user data
      if (response.data) {
        const token = localStorage.getItem("token");
        // Merge user data cũ với data mới để giữ lại username, email
        const updatedUser = {
          ...user,
          ...response.data,
        };
        dispatch(login({ user: updatedUser, token: token || "" }));
      }

      successToast("Thành công", "Cập nhật thông tin thành công!");
      setIsEditMode(false);
    } catch (error: any) {
      errorToast("Lỗi", error.message || "Cập nhật thông tin thất bại!");
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setBio(user?.bio || "");
    setDateOfBirth(user?.date_of_birth || "");
    setGender(user?.gender || "");
    setIsEditMode(false);
  };

  const openConfirmDialog = (movieId: string, movieTitle: string) => {
    setMovieToDelete({ id: movieId, title: movieTitle });
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!movieToDelete) return;

    try {
      await removeFromWatchlist(movieToDelete.id);
      dispatch(removeFromWatchlistAction(movieToDelete.id));
      successToast("Thành công", "Đã xóa khỏi danh sách xem sau");
    } catch (error: any) {
      errorToast("Lỗi", error.message || "Có lỗi xảy ra khi xóa phim");
    } finally {
      setMovieToDelete(null);
    }
  };

  const MovieCard = ({ movie }: { movie: Movie }) => (
    <Link
      href={`/movie/${movie.id}`}
      className="group relative block rounded-lg overflow-hidden bg-gray-800/50 hover:bg-gray-700/50 transition-all"
    >
      <div className="relative aspect-[2/3]">
        <Image
          src={movie.poster_url}
          alt={movie.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-2">
            <p className="text-white font-medium text-xs line-clamp-2 mb-1">
              {movie.title}
            </p>
            {movie.tmdb_vote_average && (
              <div className="flex items-center gap-1">
                <FaStar className="text-yellow-500 text-xs" />
                <span className="text-white text-xs">
                  {parseFloat(movie.tmdb_vote_average).toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="p-2">
        <p className="text-white text-xs font-medium line-clamp-1">
          {movie.title}
        </p>
        {movie.release_year && (
          <p className="text-gray-400 text-xs">{movie.release_year}</p>
        )}
      </div>
    </Link>
  );

  const WatchlistMovieCard = ({ movie }: { movie: Movie }) => (
    <div className="group relative rounded-lg overflow-hidden bg-gray-800/50 hover:bg-gray-700/50 transition-all">
      <Link href={`/movie/${movie.id}`} className="block">
        <div className="relative aspect-[2/3]">
          <Image
            src={movie.poster_url}
            alt={movie.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <p className="text-white font-medium text-xs line-clamp-2 mb-1">
                {movie.title}
              </p>
              {/* {movie.tmdb_vote_average && (
                <div className="flex items-center gap-1">
                  <FaStar className="text-yellow-500 text-xs" />
                  <span className="text-white text-xs">
                    {parseFloat(movie.tmdb_vote_average).toFixed(1)}
                  </span>
                </div>
              )} */}
            </div>
          </div>
        </div>
        <div className="p-2">
          <p className="text-white text-xs font-medium line-clamp-1">
            {movie.title}
          </p>
          {movie.release_year && (
            <p className="text-gray-400 text-xs">{movie.release_year}</p>
          )}
        </div>
      </Link>

      {/* Delete Button */}
      <div
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          isIconOnly
          size="sm"
          className="bg-red-500/90 hover:bg-red-600"
          onPress={() => openConfirmDialog(movie.id, movie.title)}
        >
          <FiTrash2 className="text-white text-sm" />
        </Button>
      </div>
    </div>
  );

  const MovieSection = ({
    title,
    icon,
    movies,
    emptyMessage,
    isWatchlist = false,
  }: {
    title: string;
    icon: React.ReactNode;
    movies: Movie[];
    emptyMessage: string;
    isWatchlist?: boolean;
  }) => (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-lg font-bold text-white">{title}</h2>
        {movies.length > 0 && (
          <Chip size="sm" variant="flat" className="ml-2">
            {movies.length}
          </Chip>
        )}
      </div>

      {movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {movies.map((movie) =>
            isWatchlist ? (
              <WatchlistMovieCard key={movie.id} movie={movie} />
            ) : (
              <MovieCard key={movie.id} movie={movie} />
            )
          )}
        </div>
      ) : (
        <Card className="bg-gray-800/30 border border-gray-700/50">
          <CardBody>
            <p className="text-gray-400 text-center py-8 text-xs">
              {emptyMessage}
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0e17] pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - User Info (1/3) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="bg-gray-800/50 border border-gray-700/50">
                <CardBody className="p-6">
                  {/* Edit Button */}
                  <div className="flex justify-end mb-2">
                    {!isEditMode ? (
                      <Button
                        size="sm"
                        variant="flat"
                        startContent={<FiEdit2 />}
                        onPress={() => setIsEditMode(true)}
                        className="text-xs"
                      >
                        Chỉnh sửa
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          color="success"
                          startContent={<FiSave />}
                          onPress={handleSave}
                          isLoading={isLoading}
                          className="text-xs"
                        >
                          Lưu
                        </Button>
                        <Button
                          size="sm"
                          variant="flat"
                          startContent={<FiX />}
                          onPress={handleCancel}
                          isDisabled={isLoading}
                          className="text-xs"
                        >
                          Hủy
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="flex justify-center mb-4">
                    <Avatar
                      src={user?.avatar || DefaultAvatar.src}
                      className="w-32 h-32 text-large ring-4 ring-yellow-500/30"
                      isBordered
                      color="warning"
                    />
                  </div>

                  {/* Display Name */}
                  <div className="text-center mb-4">
                    <h1 className="text-xl font-bold text-white mb-2">
                      {user?.username || "Guest User"}
                    </h1>

                    {/* Bio - Editable */}
                    {isEditMode ? (
                      <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Viết vài dòng về bạn..."
                        variant="flat"
                        classNames={{
                          input: "text-white text-xs",
                          inputWrapper:
                            "bg-gray-700/50 border border-gray-600 hover:border-yellow-500 focus-within:border-yellow-500",
                        }}
                        minRows={3}
                        maxRows={5}
                        size="sm"
                      />
                    ) : bio ? (
                      <p className="text-gray-400 text-xs leading-relaxed">
                        {bio}
                      </p>
                    ) : (
                      <p className="text-gray-500 text-xs italic">
                        Chưa có tiểu sử
                      </p>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="space-y-3 border-t border-gray-700/50 pt-4">
                    {/* Email - Read only */}
                    <div className="flex items-center gap-2 text-xs">
                      <FiMail className="text-gray-400 flex-shrink-0" />
                      <span className="text-gray-300 truncate">
                        {user?.email || "Not provided"}
                      </span>
                    </div>

                    {/* Date of Birth - Editable */}
                    {isEditMode ? (
                      <div className="space-y-1">
                        <label className="flex items-center gap-2 text-xs text-gray-400">
                          <FiCalendar className="flex-shrink-0" />
                          Ngày sinh
                        </label>
                        <Input
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          variant="flat"
                          classNames={{
                            input: "text-white text-xs",
                            inputWrapper:
                              "bg-gray-700/50 border border-gray-600 hover:border-yellow-500 focus-within:border-yellow-500 h-9",
                          }}
                          size="sm"
                        />
                      </div>
                    ) : dateOfBirth ? (
                      <div className="flex items-center gap-2 text-xs">
                        <FiCalendar className="text-gray-400 flex-shrink-0" />
                        <span className="text-gray-300">
                          {new Date(dateOfBirth).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs">
                        <FiCalendar className="text-gray-400 flex-shrink-0" />
                        <span className="text-gray-500 italic">
                          Chưa cập nhật
                        </span>
                      </div>
                    )}

                    {/* Gender - Editable */}
                    {isEditMode ? (
                      <div className="space-y-1">
                        <label className="flex items-center gap-2 text-xs text-gray-400">
                          <FiMapPin className="flex-shrink-0" />
                          Giới tính
                        </label>
                        <Select
                          selectedKeys={gender ? [gender] : []}
                          onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0] as string;
                            setGender(value);
                          }}
                          placeholder="Chọn giới tính"
                          variant="flat"
                          classNames={{
                            trigger:
                              "bg-gray-700/50 border border-gray-600 hover:border-yellow-500 data-[focus=true]:border-yellow-500 h-9",
                            value: "text-white text-xs",
                          }}
                          size="sm"
                        >
                          {genderOptions.map((option) => (
                            <SelectItem
                              key={option.value}
                              textValue={option.label}
                            >
                              <span className="text-xs">{option.label}</span>
                            </SelectItem>
                          ))}
                        </Select>
                      </div>
                    ) : gender ? (
                      <div className="flex items-center gap-2 text-xs">
                        <FiMapPin className="text-gray-400 flex-shrink-0" />
                        <span className="text-gray-300">
                          {gender === "male"
                            ? "Nam"
                            : gender === "female"
                              ? "Nữ"
                              : "Khác"}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs">
                        <FiMapPin className="text-gray-400 flex-shrink-0" />
                        <span className="text-gray-500 italic">
                          Chưa cập nhật
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-700/50">
                    <div className="text-center">
                      <p className="text-white font-bold text-lg">
                        {recentMovies.length}
                      </p>
                      <p className="text-gray-400 text-xs">Đã xem</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-bold text-lg">
                        {likedMovies.length}
                      </p>
                      <p className="text-gray-400 text-xs">Yêu thích</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-bold text-lg">
                        {watchlistMovies.length}
                      </p>
                      <p className="text-gray-400 text-xs">Danh sách</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>

          {/* Right Content - Movies Lists (2/3) */}
          <div className="lg:col-span-2">
            {/* Recent Movies */}
            <MovieSection
              title="Phim xem gần đây"
              icon={<FiClock className="text-yellow-500 text-lg" />}
              movies={recentMovies}
              emptyMessage="Bạn chưa xem phim nào gần đây"
            />

            {/* Liked Movies */}
            <MovieSection
              title="Phim đã thích"
              icon={<FiHeart className="text-red-500 text-lg" />}
              movies={likedMovies}
              emptyMessage="Bạn chưa thích phim nào"
            />

            {/* Watchlist */}
            <MovieSection
              title="Danh sách xem sau"
              icon={<FiBookmark className="text-blue-500 text-lg" />}
              movies={watchlistMovies}
              emptyMessage="Danh sách xem sau của bạn đang trống"
              isWatchlist={true}
            />
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa "${movieToDelete?.title}" khỏi danh sách xem sau?`}
        confirmText="Xóa"
        cancelText="Hủy"
        confirmColor="danger"
      />
    </div>
  );
};

export default UserProfile;
