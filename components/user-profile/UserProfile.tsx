"use client";

import React, { useState, useRef } from "react";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { useAppSelector } from "@/store/hooks";
import {
  FiCamera,
  FiUser,
  FiMail,
  FiSave,
  FiCalendar,
  FiFileText,
} from "react-icons/fi";
import { BiMale } from "react-icons/bi";
import { successToast, errorToast } from "@/components/ui/toast";
import DefaultAvatar from "@/public/default_avt.png";

const UserProfile = () => {
  const user = useAppSelector((state) => state.auth.user);

  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [dateOfBirth, setDateOfBirth] = useState(user?.date_of_birth || "");
  const [gender, setGender] = useState<string>(user?.gender || "");
  const [avatarPreview, setAvatarPreview] = useState(
    user?.avatar || DefaultAvatar.src
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const genderOptions = [
    { value: "male", label: "Nam" },
    { value: "female", label: "Nữ" },
    { value: "other", label: "Khác" },
  ];

  // Xử lý chọn file avatar
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Kiểm tra loại file
    if (!file.type.startsWith("image/")) {
      errorToast("Lỗi", "Vui lòng chọn file ảnh!");
      return;
    }

    // Kiểm tra kích thước file (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      errorToast("Lỗi", "Kích thước ảnh phải nhỏ hơn 5MB!");
      return;
    }

    // Tạo preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
      setAvatarFile(file);
    };
    reader.readAsDataURL(file);
  };

  // Xử lý click vào avatar để chọn file
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Xử lý lưu thông tin
  const handleSave = async () => {
    setIsLoading(true);

    try {
      // TODO: Gọi API để cập nhật thông tin user
      // const formData = new FormData();
      // formData.append("username", username);
      // formData.append("bio", bio);
      // formData.append("date_of_birth", dateOfBirth);
      // formData.append("gender", gender);
      // if (avatarFile) {
      //   formData.append("avatar", avatarFile);
      // }
      // await updateUserProfile(formData);

      // Giả lập API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      successToast("Thành công", "Cập nhật thông tin thành công!");
    } catch (error) {
      errorToast("Lỗi", "Cập nhật thông tin thất bại!");
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] pb-20">
      {/* Header Section với Avatar */}
      <div className="relative bg-gradient-to-b from-gray-800/50 to-transparent pb-32">
        <div className="max-w-6xl mx-auto px-6 pt-12">
          <h1 className="text-4xl font-bold text-white mb-12">
            Cài đặt tài khoản
          </h1>

          {/* Avatar Section - Nổi bật */}
          <div className="flex flex-col items-center">
            <div className="relative group mb-6">
              <Avatar
                src={avatarPreview}
                className="w-40 h-40 text-large ring-4 ring-yellow-500/50 hover:ring-yellow-500 transition-all"
                isBordered
                color="warning"
              />

              {/* Overlay khi hover */}
              <button
                onClick={handleAvatarClick}
                className="absolute inset-0 rounded-full bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                type="button"
              >
                <FiCamera className="text-white text-3xl mb-2" />
                <span className="text-white text-sm font-medium">
                  Đổi ảnh
                </span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />

            <p className="text-gray-400 text-sm">
              JPG, PNG hoặc GIF • Tối đa 5MB
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-4xl mx-auto px-6 -mt-20">
        <div className="space-y-8">
          {/* Thông tin cơ bản */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-1 h-8 bg-yellow-500 rounded-full"></div>
              Thông tin cơ bản
            </h2>

            <div className="space-y-6">
              {/* Username */}
              <div className="group">
                <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <FiUser className="text-yellow-500" />
                  Tên người dùng
                </label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên của bạn"
                  variant="flat"
                  classNames={{
                    input: "text-white text-base",
                    inputWrapper:
                      "bg-gray-800/50 border border-gray-700 hover:border-yellow-500 focus-within:border-yellow-500 h-14 transition-all",
                  }}
                  size="lg"
                />
              </div>

              {/* Email */}
              <div className="group">
                <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <FiMail className="text-yellow-500" />
                  Email
                </label>
                <Input
                  value={user?.email || ""}
                  isReadOnly
                  variant="flat"
                  classNames={{
                    input: "text-gray-400 text-base",
                    inputWrapper:
                      "bg-gray-800/30 border border-gray-700/50 h-14",
                  }}
                  size="lg"
                  description="Email không thể thay đổi"
                />
              </div>

              {/* Bio */}
              <div className="group">
                <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <FiFileText className="text-yellow-500" />
                  Tiểu sử
                </label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Viết vài dòng về bạn..."
                  variant="flat"
                  classNames={{
                    input: "text-white text-base",
                    inputWrapper:
                      "bg-gray-800/50 border border-gray-700 hover:border-yellow-500 focus-within:border-yellow-500 transition-all",
                  }}
                  minRows={4}
                  maxRows={6}
                />
              </div>
            </div>
          </div>

          {/* Thông tin cá nhân */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-1 h-8 bg-yellow-500 rounded-full"></div>
              Thông tin cá nhân
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date of Birth */}
              <div className="group">
                <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <FiCalendar className="text-yellow-500" />
                  Ngày sinh
                </label>
                <Input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  variant="flat"
                  classNames={{
                    input: "text-white text-base",
                    inputWrapper:
                      "bg-gray-800/50 border border-gray-700 hover:border-yellow-500 focus-within:border-yellow-500 h-14 transition-all",
                  }}
                  size="lg"
                />
              </div>

              {/* Gender */}
              <div className="group">
                <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <BiMale className="text-yellow-500" />
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
                      "bg-gray-800/50 border border-gray-700 hover:border-yellow-500 data-[focus=true]:border-yellow-500 h-14 transition-all",
                    value: "text-white text-base",
                  }}
                  size="lg"
                >
                  {genderOptions.map((option) => (
                    <SelectItem key={option.value}>{option.label}</SelectItem>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-700/50">
            <Button
              color="warning"
              size="lg"
              startContent={<FiSave />}
              onPress={handleSave}
              isLoading={isLoading}
              className="flex-1 sm:flex-none sm:px-12 font-semibold text-base h-14"
            >
              Lưu thay đổi
            </Button>

            <Button
              variant="bordered"
              size="lg"
              onPress={() => {
                setUsername(user?.username || "");
                setBio(user?.bio || "");
                setDateOfBirth(user?.date_of_birth || "");
                setGender(user?.gender || "");
                setAvatarPreview(user?.avatar || DefaultAvatar.src);
                setAvatarFile(null);
              }}
              isDisabled={isLoading}
              className="border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-800/50 text-base h-14 sm:px-8"
            >
              Hủy bỏ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

