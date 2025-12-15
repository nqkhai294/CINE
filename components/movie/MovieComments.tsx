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

  useEffect(() => {
    handleGetComments();
  }, []);

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
      successToast("Success", "Bình luận đã được gửi.");
    } catch (error) {
      console.error("Error submitting comment:", error);
      errorToast("Error", "Lỗi khi gửi bình luận.");
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
                  <Avatar src={user?.avatar || DefaultAvatar.src} size="md" />
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

                <div className="flex items-center justify-between mt-4">
                  <label className="flex items-center gap-2 text-gray-400 text-sm cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span>Tiết lộ?</span>
                  </label>

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
                      <Avatar src={cmt.user.avatar} size="md" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-white">
                            {cmt.user.name}
                          </span>
                          <span className="text-gray-500 text-sm">
                            • {cmt.createdAt}
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
