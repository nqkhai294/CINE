"use client";

import { useState, useRef } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { FcGoogle } from "react-icons/fc";
import { addToast, useToast } from "@heroui/toast";
import Turnstile from "react-turnstile";
import { loginUser, registerUser } from "@/api/api";
import { errorToast, successToast } from "../ui/toast";

import { useAppDispatch } from "@/store/hooks";
import { login } from "@/store/slices/authSlice";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [isRegister, setIsRegister] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [turnstileKey, setTurnstileKey] = useState(0);

  const dispatch = useAppDispatch();

  // Login fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Register fields
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  // Reset turnstile widget
  const resetTurnstile = () => {
    setTurnstileToken("");
    setTurnstileKey((prev) => prev + 1);
  };

  // Clear form data when modal closes
  const handleClose = () => {
    resetFrom();
    onClose();
  };

  const resetFrom = () => {
    setUsername("");
    setPassword("");
    setEmail("");
    setDisplayName("");
    resetTurnstile();
  };

  const handleSubmit = async () => {
    if (isRegister) {
      await handleRegister();
    } else {
      await handleLogin();
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      if (!email || !username || !password || !displayName) {
        errorToast("Error", "Vui lòng điền đầy đủ thông tin");
        return;
      }

      if (!turnstileToken) {
        errorToast("Error", "Vui lòng xác thực Turnstile");
        return;
      }

      const res = await registerUser(
        email,
        username,
        password,
        displayName,
        turnstileToken
      );

      if (res && res.result.status === "ok") {
        successToast("Success", "Đăng ký thành công!");
        setIsRegister(false);
        // Clear form
        resetFrom();
      } else {
        errorToast("Error", res?.message || "Đăng ký thất bại!");
        // Reset turnstile on error
        resetTurnstile();
      }
    } catch (error: any) {
      console.error("Error during registration:", error);
      errorToast("Error", error.message || "Đăng ký thất bại!");
      // Reset turnstile on error
      resetTurnstile();
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      if (!username || !password) {
        errorToast("Error", "Vui lòng điền đầy đủ thông tin");
        return;
      }

      if (!turnstileToken) {
        errorToast("Error", "Vui lòng xác thực Turnstile");
        return;
      }

      const res = await loginUser(username, password, turnstileToken);

      if (res && res.result.status == "ok") {
        dispatch(
          login({
            user: res.data.user,
            token: res.data.token,
          })
        );
        successToast("Success", "Đăng nhập thành công!");

        handleClose();
      } else {
        errorToast("Error", res?.message || "Đăng nhập thất bại!");
        // Reset turnstile on error
        resetTurnstile();
      }
    } catch (error: any) {
      console.error("Error during login:", error);
      errorToast("Error", error.message || "Đăng nhập thất bại!");
      // Reset turnstile on error
      resetTurnstile();
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSubmit();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      placement="center"
      size="sm"
      classNames={{
        base: "bg-[#1e2a3a]",
        closeButton: "hover:bg-white/10 text-white",
      }}
      backdrop="opaque"
    >
      <ModalContent className="text-white p-2">
        <ModalHeader className="flex flex-col gap-1 pb-2 pt-4">
          <h2 className="text-xl font-bold">
            {isRegister ? "Đăng ký" : "Đăng nhập"}
          </h2>
          <p className="text-sm font-normal text-gray-400">
            {isRegister
              ? "Nếu bạn đã có tài khoản, "
              : "Nếu bạn chưa có tài khoản, "}
            <Link
              href="#"
              className="text-yellow-500 text-sm"
              onPress={() => {
                setIsRegister(!isRegister);
                resetFrom();
              }}
            >
              {isRegister ? "đăng nhập" : "đăng ký ngay"}
            </Link>
          </p>
        </ModalHeader>
        <ModalBody className="py-4">
          <div className="flex flex-col gap-4">
            {isRegister ? (
              <>
                {/* Register Form */}
                <Input
                  type="email"
                  label="Email"
                  placeholder=""
                  variant="flat"
                  labelPlacement="inside"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  classNames={{
                    input: "text-white",
                    label: "text-gray-400",
                    inputWrapper: "bg-[#2a3847] border-none",
                  }}
                />

                <Input
                  type="text"
                  label="Tên người dùng"
                  placeholder=""
                  variant="flat"
                  labelPlacement="inside"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  classNames={{
                    input: "text-white",
                    label: "text-gray-400",
                    inputWrapper: "bg-[#2a3847] border-none",
                  }}
                />

                <Input
                  type="text"
                  label="Tên hiển thị"
                  placeholder=""
                  variant="flat"
                  labelPlacement="inside"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  classNames={{
                    input: "text-white",
                    label: "text-gray-400",
                    inputWrapper: "bg-[#2a3847] border-none",
                  }}
                />

                <Input
                  type="password"
                  label="Mật khẩu"
                  placeholder=""
                  variant="flat"
                  labelPlacement="inside"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  classNames={{
                    input: "text-white",
                    label: "text-gray-400",
                    inputWrapper: "bg-[#2a3847] border-none",
                  }}
                />
              </>
            ) : (
              <>
                {/* Login Form */}
                <Input
                  type="text"
                  label="Tên người dùng"
                  placeholder=""
                  variant="flat"
                  labelPlacement="inside"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  classNames={{
                    input: "text-white",
                    label: "text-gray-400",
                    inputWrapper: "bg-[#2a3847] border-none",
                  }}
                />

                <Input
                  type="password"
                  label="Mật khẩu"
                  placeholder=""
                  variant="flat"
                  labelPlacement="inside"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  classNames={{
                    input: "text-white",
                    label: "text-gray-400",
                    inputWrapper: "bg-[#2a3847] border-none",
                  }}
                />
              </>
            )}

            {/* Cloudflare Turnstile */}
            <div className="flex justify-center">
              <Turnstile
                key={turnstileKey}
                sitekey={
                  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
                  "1x00000000000000000000AA"
                }
                onVerify={(token: string) => setTurnstileToken(token)}
                onExpire={() => {
                  setTurnstileToken("");
                  errorToast(
                    "Error",
                    "Xác thực Turnstile đã hết hạn, vui lòng thử lại"
                  );
                }}
                onError={() => {
                  setTurnstileToken("");
                  errorToast(
                    "Error",
                    "Lỗi xác thực Turnstile, vui lòng thử lại"
                  );
                }}
                theme="dark"
              />
            </div>

            {/* Action Button */}
            <Button
              className="w-full bg-yellow-500 text-black font-semibold hover:bg-yellow-600"
              onPress={handleSubmit}
              isLoading={isLoading}
            >
              {isRegister ? "Đăng ký" : "Đăng nhập"}
            </Button>

            {/* Forgot Password */}
            {!isRegister && (
              <div className="text-center">
                <Link
                  href="#"
                  className="text-sm text-gray-400 hover:text-white"
                >
                  Quên mật khẩu?
                </Link>
              </div>
            )}

            {/* Google Login */}
            <Button
              variant="bordered"
              className="w-full border-gray-600 text-white hover:bg-white/5"
              startContent={<FcGoogle className="text-xl" />}
            >
              {isRegister ? "Đăng ký" : "Đăng nhập"} với Goolge
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
