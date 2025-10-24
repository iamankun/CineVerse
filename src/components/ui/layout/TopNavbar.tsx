"use client";

import { siteConfig } from "@/config/site";
import { usePathname } from "next/navigation";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react";
import BackButton from "@/components/ui/button/BackButton";
import { useWindowScroll } from "@mantine/hooks";
import ThemeSwitchDropdown from "../input/ThemeSwitchDropdown";
import FullscreenToggleButton from "../button/FullscreenToggleButton";
import { cn } from "@/utils/helpers";
import BrandLogo from "../other/BrandLogo";
import UserProfileButton from "../button/UserProfileButton";

const TopNavbar = () => {
  const pathName = usePathname();
  const [{ y }] = useWindowScroll();
  const opacity = Math.min((y / 1000) * 5, 1);
  const hrefs = siteConfig.navItems.map((item) => item.href);
  const show = hrefs.includes(pathName);
  const tv = pathName.includes("/tv/");
  const player = pathName.includes("/player");
  const auth = pathName.includes("/auth");

  if (auth || player) return null;

  return (
    <Navbar
      disableScrollHandler
      isBlurred={false}
      position="sticky"
      maxWidth="full"
      classNames={{ wrapper: "px-2 md:px-4" }}
      className={cn(
        "inset-0 h-min backdrop-blur-xl backdrop-saturate-150",
        "bg-background/70 border-b border-white/10",
        "shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]",
        {
          "bg-background/80": show,
        }
      )}
    >
      {!show && (
        <div
          className="absolute inset-0 h-full w-full"
          style={{ opacity: opacity }}
        />
      )}
      <NavbarBrand>
        {show ? <BrandLogo /> : <BackButton href={tv ? "/?content=tv" : "/"} />}
      </NavbarBrand>
      <NavbarContent justify="end">
        <NavbarItem className="flex gap-1">
          <ThemeSwitchDropdown />
          <FullscreenToggleButton />
          <UserProfileButton />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};

export default TopNavbar;
