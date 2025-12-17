"use client";

import { CldUploadWidget } from "next-cloudinary";
import { Button } from "@heroui/button";
import { FaCamera } from "react-icons/fa";
import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import Image from "next/image";

interface AvatarUploaderProps {
  onUploadSuccess: (url: string) => void; // Hàm callback khi upload xong
}

export default function AvatarUploader({
  onUploadSuccess,
}: AvatarUploaderProps) {
  const uploadPreset =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "CINE_MOVIE";

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Check if Cloudinary is configured
  if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
    console.error(
      "Chưa cấu hình NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME trong file .env"
    );
    return null;
  }

  if (!uploadPreset) {
    console.error(
      "Chưa cấu hình NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET trong file .env"
    );
    return null;
  }

  const handleConfirm = () => {
    if (previewUrl) {
      onUploadSuccess(previewUrl);
      setShowPreview(false);
      setPreviewUrl(null);
    }
  };

  const handleCancel = () => {
    setShowPreview(false);
    setPreviewUrl(null);
  };

  return (
    <>
      <CldUploadWidget
        uploadPreset={uploadPreset}
        options={{
          maxFiles: 1,
          resourceType: "image",
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
          maxFileSize: 5000000, // 5MB
          sources: ["local", "camera", "url"],
          multiple: false,
        }}
        onSuccess={(result: any) => {
          // Lưu URL và hiện modal preview
          if (result.info && result.info.secure_url) {
            setPreviewUrl(result.info.secure_url);
            setShowPreview(true);
          }
        }}
      >
        {({ open }) => {
          return (
            <Button
              isIconOnly
              color="default"
              radius="full"
              size="sm"
              className="shadow-md"
              onPress={() => open()}
            >
              <FaCamera />
            </Button>
          );
        }}
      </CldUploadWidget>

      {/* Preview Modal */}
      <Modal isOpen={showPreview} onClose={handleCancel} size="md">
        <ModalContent>
          <ModalHeader>Xác nhận avatar mới</ModalHeader>
          <ModalBody>
            {previewUrl && (
              <div className="flex justify-center">
                <Image
                  src={previewUrl}
                  alt="Avatar preview"
                  width={200}
                  height={200}
                  className="rounded-full object-cover"
                />
              </div>
            )}
            <p className="text-center text-sm text-gray-400 mt-4">
              Bạn có muốn sử dụng ảnh này làm avatar?
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="flat"
              onPress={handleCancel}
              size="sm"
            >
              Hủy
            </Button>
            <Button color="primary" onPress={handleConfirm} size="sm">
              Xác nhận
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
