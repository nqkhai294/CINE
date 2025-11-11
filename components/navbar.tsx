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
import { LoginModal } from "@/components/login-modal";

import { IoPerson } from "react-icons/io5";
import Image from "next/image";
import AppLogo from "@/public/logo.png";

import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

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
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-black/30 border-white/20",
        input: "text-sm text-white placeholder:text-white/60 min-w-[250px]",
      }}
      labelPlacement="outside"
      placeholder="Tìm kiếm phim, diễn viên"
      startContent={
        <SearchIcon className="text-sm text-white/60 pointer-events-none flex-shrink-0" />
      }
      type="search"
      variant="bordered"
    />
  );

  return (
    <>
      <HeroUINavbar
        maxWidth="full"
        className={clsx(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-black/95 backdrop-blur-md shadow-xl"
            : "!bg-transparent shadow-none"
        )}
        classNames={{
          wrapper: "px-6 !bg-transparent",
          base: "!bg-transparent",
        }}
        style={{
          background: scrolled ? undefined : "transparent",
          backdropFilter: scrolled ? undefined : "none",
        }}
      >
        <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
          <NavbarBrand as="li" className="gap-2 max-w-fit min-w-[120px]">
            <NextLink
              className="flex justify-start items-center gap-2"
              href="/"
            >
              <Image
                src={AppLogo}
                alt="logo"
                width={180}
                height={100}
                className="w-[180px] h-[100px] object-contain"
              />
            </NextLink>
          </NavbarBrand>

          <div className="hidden md:flex ml-8 mr-8 flex-1">{searchInput}</div>

          <ul className="hidden lg:flex gap-6 justify-start text-sm flex-shrink-0 whitespace-nowrap ml-4">
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

        <NavbarContent className="flex basis-1/5 sm:basis-full" justify="end">
          <NavbarItem className="flex gap-3 items-center">
            {isAuthenticated ? (
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Avatar
                    as="button"
                    className="transition-transform cursor-pointer hover:scale-110 ring-2 ring-offset-2 ring-white/30 hover:ring-yellow-500"
                    src={user?.avatar || DefaultAvatar.src}
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
                className="text-sm font-semibold text-black bg-white/90 h-10 rounded-full"
                color="default"
                variant="flat"
                startContent={<IoPerson size={16} />}
                onPress={() => setLoginModalOpen(true)}
                size="sm"
              >
                Thành viên
              </Button>
            )}
          </NavbarItem>
        </NavbarContent>
      </HeroUINavbar>

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
