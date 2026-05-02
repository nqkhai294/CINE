"use client";

import React, { useEffect, useState } from "react";
import { Tabs, Tab } from "@heroui/tabs";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Textarea } from "@heroui/input";
import { FiMessageCircle } from "react-icons/fi";
import { useAppSelector } from "@/store/hooks";
import DefaultAvatar from "@/public/default_avt.png";
import { LoginModal } from "../auth/login-modal";
import { addCommentToMovie, getCommentsForMovie } from "@/api/api";
import { errorToast, successToast } from "../ui/toast";

interface MovieCommentsProps {
  movieId?: string;
}

export interface Comment {
  id: number;
  user: {
    id: number;
    name: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
}

const MovieComments = ({ movieId = "" }: MovieCommentsProps) => {
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);

  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Format thời gian hiển thị
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    // Nếu trong vòng 1 phút
    if (diffInMinutes < 1) {
      return "Vừa xong";
    }
    // Nếu trong vòng 1 giờ
    if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    }
    // Nếu trong vòng 24 giờ
    if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    }
    // Nếu trong vòng 7 ngày
    if (diffInDays < 7) {
      return `${diffInDays} ngày trước`;
    }
    // Còn lại hiển thị ngày/tháng/năm
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  useEffect(() => {
    if (!movieId) return;
    handleGetComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId]);

  const handleGetComments = async () => {
    const res = await getCommentsForMovie(movieId);
    console.log(res);
    setComments(res.data);
  };

  const handleSubmit = async () => {
    if (!comment.trim()) return;

    const newComment: any = {
      movieId: movieId,
      content: comment.trim(),
    };

    try {
      const res = await addCommentToMovie(newComment);
      setComment("");
      handleGetComments();
      successToast("Thành công", "Bình luận đã được gửi.");
    } catch (error) {
      console.error("Error submitting comment:", error);
      errorToast("Lỗi", "Lỗi khi gửi bình luận.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with icon and count */}
      <div className="flex items-center gap-3">
        <FiMessageCircle className="text-xl text-white" />
        <h2 className="text-xl font-bold text-white">
          Bình luận ({comments.length})
        </h2>
      </div>

      {/* Tabs for Comments and Reviews */}
      <Tabs
        aria-label="Comment tabs"
        variant="underlined"
        color="warning"
        classNames={{
          tabList:
            "gap-6 w-full relative rounded-none p-0 border-b border-gray-800",
          cursor: "w-full bg-yellow-500",
          tab: "max-w-fit px-4 h-12",
          tabContent:
            "group-data-[selected=true]:text-white text-gray-400 font-medium",
        }}
      >
        <Tab key="comments" title="Bình luận">
          <div className="py-6 space-y-6">
            {/* Comment Form */}
            {isAuthenticated ? (
              <div className="bg-[#1e2a3a] rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar
                    src={user?.avatar_url || DefaultAvatar.src}
                    size="md"
                  />
                  <span className="text-gray-400 text-sm">
                    Bình luận với tên {user?.username}
                  </span>
                </div>

                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Viết bình luận"
                  variant="flat"
                  classNames={{
                    input: "text-white text-sm",
                    inputWrapper: "bg-[#2a3a4a] border-0",
                  }}
                  minRows={3}
                  maxLength={1000}
                  description={`${comment.length} / 1000`}
                />

                <div className="flex justify-end mt-4">
                  <Button
                    color="warning"
                    className="font-semibold"
                    onPress={handleSubmit}
                    isDisabled={!comment.trim()}
                  >
                    Gửi
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-[#1e2a3a] rounded-lg p-8 text-center">
                <p className="text-gray-400 mb-4">
                  Vui lòng{" "}
                  <span
                    className="text-yellow-500 underline cursor-pointer"
                    onClick={() => setLoginModalOpen(true)}
                  >
                    đăng nhập
                  </span>{" "}
                  để tham gia bình luận.
                </p>
              </div>
            )}

            {/* Comments List */}
            {comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((cmt) => (
                  <div key={cmt.id} className="bg-[#1e2a3a] rounded-lg p-6">
                    <div className="flex gap-4">
                      <Avatar
                        src={
                          cmt.user.avatar?.trim()
                            ? cmt.user.avatar.trim()
                            : DefaultAvatar.src
                        }
                        size="md"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-white">
                            {cmt.user.name}
                          </span>
                          <span className="text-gray-500 text-sm">
                            • {formatDateTime(cmt.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-300">{cmt.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">Chưa có bình luận nào</p>
              </div>
            )}
          </div>
        </Tab>

        <Tab key="reviews" title="Đánh giá">
          <div className="py-6">
            <div className="text-center py-12">
              <p className="text-gray-400">Chưa có đánh giá nào</p>
            </div>
          </div>
        </Tab>
      </Tabs>

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  );
};

export default MovieComments;
