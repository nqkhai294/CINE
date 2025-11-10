"use client";

import { useState, useEffect } from "react";
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarBrand,
  NavbarItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Kbd } from "@heroui/kbd";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { SearchIcon, Logo } from "@/components/icons";
import { LoginModal } from "@/components/login-modal";

import { IoPerson } from "react-icons/io5";

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

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
          <NavbarBrand as="li" className="gap-2 max-w-fit">
            <NextLink
              className="flex justify-start items-center gap-2"
              href="/"
            >
              <Logo size={28} />
              <p className="font-bold text-lg text-white">CINE</p>
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
            <ThemeSwitch />
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
          </NavbarItem>
        </NavbarContent>
      </HeroUINavbar>

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </>
  );
};
