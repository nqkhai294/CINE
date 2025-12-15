"use client";

import { CldUploadWidget } from "next-cloudinary";
import { Button } from "@heroui/button";
import { FaCamera } from "react-icons/fa";

interface AvatarUploaderProps {
  onUploadSuccess: (url: string) => void; // Hàm callback khi upload xong
}

export default function AvatarUploader({
  onUploadSuccess,
}: AvatarUploaderProps) {
  const uploadPreset =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "CINE_MOVIE";

  if (!uploadPreset) {
    console.error(
      "Chưa cấu hình NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET trong file .env"
    );
    return null;
  }

  return (
    <CldUploadWidget
      uploadPreset={uploadPreset}
      options={{
        maxFiles: 1,
        resourceType: "image",
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
        maxFileSize: 5000000, // 5MB
        sources: ["local", "camera", "url"],
      }}
      onSuccess={(result: any) => {
        if (result.info && result.info.secure_url) {
          onUploadSuccess(result.info.secure_url);
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
  );
}
