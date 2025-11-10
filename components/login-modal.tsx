"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@heroui/modal";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Link } from "@heroui/link";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      placement="center"
      size="lg"
      classNames={{
        base: "bg-[#1a2332] rounded-lg",
        closeButton: "hover:bg-white/5 active:bg-white/10 text-white",
      }}
    >
      <ModalContent className="text-white rounded-lg">
        <ModalHeader className="flex flex-col gap-1 text-center pb-2">
          <h2 className="text-xl font-bold">Đăng nhập</h2>
          <p className="text-xs font-normal text-gray-400">
            Nếu bạn chưa có tài khoản,{" "}
            <Link href="#" className="text-warning text-xs">
              đăng ký ngay
            </Link>
          </p>
        </ModalHeader>
        <ModalBody className="py-6">
          {/* Email Input */}
          <Input
            type="email"
            label="Email"
            placeholder="Nhập email"
            variant="bordered"
            size="sm"
            classNames={{
              input: "text-white text-sm",
              label: "text-gray-400 text-xs",
              inputWrapper: "border-gray-600 hover:border-gray-500 bg-[#0f1823] rounded-md",
            }}
          />

          {/* Password Input */}
          <Input
            type="password"
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            variant="bordered"
            size="sm"
            classNames={{
              input: "text-white text-sm",
              label: "text-gray-400 text-xs",
              inputWrapper: "border-gray-600 hover:border-gray-500 bg-[#0f1823] rounded-md",
            }}
          />

          {/* Captcha Placeholder */}
          <div className="flex items-center justify-center p-3 border border-gray-600 rounded-md bg-[#0f1823] min-h-[70px]">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse delay-100" />
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse delay-200" />
              </div>
              <span className="text-xs text-gray-400">Đang xác minh...</span>
            </div>
          </div>

          {/* Login Button */}
          <Button 
            color="warning" 
            size="md" 
            className="w-full font-medium text-sm rounded-md"
          >
            Đăng nhập
          </Button>

          {/* Forgot Password */}
          <div className="text-center">
            <Link href="#" className="text-xs text-gray-400 hover:text-white">
              Quên mật khẩu?
            </Link>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-2">
            <Divider className="flex-1 bg-gray-600" />
            <Divider className="flex-1 bg-gray-600" />
          </div>

          {/* Google Login */}
          <Button
            variant="bordered"
            size="md"
            className="w-full border-gray-600 hover:bg-white/5 text-white text-sm rounded-md"
            startContent={
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            }
          >
            Đăng nhập với tên Khải
          </Button>

          {/* Info Text */}
          <p className="text-[10px] text-center text-gray-500 mt-3">
            Khi đăng nhập, bạn đồng ý với{" "}
            <Link href="#" className="text-warning text-[10px]">
              Điều khoản sử dụng
            </Link>{" "}
            và{" "}
            <Link href="#" className="text-warning text-[10px]">
              Chính sách bảo mật
            </Link>
          </p>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
