"use client";

import { useState, useEffect } from "react";
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarBrand,
  NavbarItem,
} from "@heroui/navbar";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@heroui/dropdown";
import { Avatar } from "@heroui/avatar";
import DefaultAvatar from "@/public/default_avt.png";

import { Button } from "@heroui/button";
import { Kbd } from "@heroui/kbd";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import { link as linkStyles } from "@heroui/theme";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import NextLink from "next/link";
import clsx from "clsx";
import { useRouter, usePathname } from "next/navigation";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { SearchIcon, Logo } from "@/components/icons";
import { LoginModal } from "@/components/auth/login-modal";

import { IoPerson } from "react-icons/io5";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import Image from "next/image";
import AppLogo from "@/public/logo.png";

import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { login, logout } from "@/store/slices/authSlice";
import { SearchBar } from "@/components/layout/search-bar";
import { getCurrentUser } from "@/api/api";

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    dispatch(logout());
    setLogoutModalOpen(false);

    // Nếu đang ở trang chủ, refresh lại
    if (pathname === "/") {
      window.location.reload();
    } else {
      // Nếu không, chuyển về trang chủ
      router.push("/");
    }
  };

  useEffect(() => {
    const getUser = async () => {
      if (user) {
        const response = await getCurrentUser(user.id);
        if (response.data) {
          const token = localStorage.getItem("token");

          const updatedUser = {
            ...user,
            ...response.data,
          };

          dispatch(
            login({
              user: updatedUser,
              token: token || "",
            })
          );
        }
      }
    };

    getUser();
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <HeroUINavbar
        maxWidth="full"
        className={clsx(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled ? "bg-[#0a0e17] shadow-xl" : "!bg-transparent shadow-none"
        )}
        classNames={{
          wrapper: scrolled ? "px-6 bg-[#0a0e17]" : "px-6 !bg-transparent",
          base: scrolled ? "bg-[#0a0e17]" : "!bg-transparent",
        }}
        style={{
          background: scrolled ? "#0a0e17" : "transparent",
          backdropFilter: "none",
        }}
      >
        {/* Mobile Menu Button - Left */}
        <NavbarContent className="lg:hidden" justify="start">
          <Button
            isIconOnly
            variant="light"
            onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white"
          >
            {mobileMenuOpen ? <HiX size={24} /> : <HiMenuAlt3 size={24} />}
          </Button>
        </NavbarContent>

        {/* Logo - Center on mobile, left on desktop */}
        <NavbarContent className="flex-grow lg:flex-grow-0" justify="center">
          <NavbarBrand as="li" className="gap-2 flex-shrink-0">
            <NextLink
              className="flex items-center justify-center gap-2"
              href="/"
            >
              <Image
                src={AppLogo}
                alt="logo"
                width={120}
                height={70}
                className="w-[100px] h-[60px] sm:w-[120px] sm:h-[70px] object-contain flex-shrink-0"
              />
            </NextLink>
          </NavbarBrand>
        </NavbarContent>

        {/* Search Bar - Desktop only */}
        <NavbarContent className="hidden lg:flex flex-grow" justify="start">
          <div className="flex mx-4 w-[230px] flex-shrink-0">
            <SearchBar />
          </div>

          <ul className="flex gap-4 justify-start text-sm flex-shrink-0 whitespace-nowrap ml-2">
            {siteConfig.navItems.map((item) => (
              <NavbarItem key={item.href}>
                <NextLink
                  className="text-white/90 hover:text-white transition-colors text-sm font-normal"
                  href={item.href}
                >
                  {item.label}
                </NextLink>
              </NavbarItem>
            ))}
          </ul>
        </NavbarContent>

        {/* User Avatar/Login - Right */}
        <NavbarContent className="flex-shrink-0" justify="end">
          <NavbarItem className="flex gap-3 items-center">
            {isAuthenticated ? (
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Avatar
                    as="button"
                    className="transition-transform cursor-pointer hover:scale-110 ring-2 ring-offset-2 ring-white/30 hover:ring-yellow-500"
                    src={user?.avatar_url || DefaultAvatar.src}
                    size="md"
                    isBordered
                    color="warning"
                  />
                </DropdownTrigger>
                <DropdownMenu aria-label="User menu" variant="flat">
                  <DropdownSection showDivider>
                    <DropdownItem
                      key="profile-info"
                      className="h-14 gap-2"
                      textValue="Profile info"
                    >
                      <p className="font-semibold">{user?.username}</p>
                      <p className="text-sm text-default-500">{user?.email}</p>
                    </DropdownItem>
                  </DropdownSection>

                  <DropdownItem key="profile" as={NextLink} href="/profile">
                    Thông tin
                  </DropdownItem>

                  <DropdownItem
                    key="logout"
                    color="danger"
                    onPress={() => setLogoutModalOpen(true)}
                  >
                    Đăng xuất
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            ) : (
              <Button
                className="text-xs sm:text-sm font-semibold text-black bg-white/90 h-8 sm:h-10 rounded-full px-3 sm:px-4"
                color="default"
                variant="flat"
                startContent={
                  <IoPerson size={16} className="hidden sm:block" />
                }
                onPress={() => setLoginModalOpen(true)}
                size="sm"
              >
                <span className="hidden sm:inline">Thành viên</span>
                <span className="sm:hidden">Login</span>
              </Button>
            )}
          </NavbarItem>
        </NavbarContent>
      </HeroUINavbar>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="fixed top-[60px] left-0 right-0 bg-[#0a0e17] z-40 lg:hidden shadow-xl">
          <div className="px-4 py-4 space-y-4">
            {/* Search Bar Mobile */}
            <div className="w-full">
              <SearchBar />
            </div>

            {/* Navigation Links */}
            <div className="flex flex-col space-y-2">
              {siteConfig.navItems.map((item) => (
                <NextLink
                  key={item.href}
                  className="text-white/90 hover:text-white hover:bg-white/10 transition-colors text-sm font-normal py-3 px-4 rounded-lg"
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </NextLink>
              ))}
            </div>
          </div>
        </div>
      )}

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        size="sm"
        placement="center"
        classNames={{
          base: "bg-[#1e2a3a]",
          closeButton: "hover:bg-white/10 text-white",
        }}
        backdrop="opaque"
      >
        <ModalContent className="text-white">
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold">Xác nhận đăng xuất</h3>
          </ModalHeader>
          <ModalBody>
            <p className="text-gray-300">
              Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="light"
              onPress={() => setLogoutModalOpen(false)}
            >
              Hủy
            </Button>
            <Button color="danger" onPress={handleLogout}>
              Đăng xuất
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
