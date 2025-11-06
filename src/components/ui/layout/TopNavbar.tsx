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
import { Next } from "@/utils/icons";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";

const TopNavbar = () => {
  const pathName = usePathname();
  const [{ y }] = useWindowScroll();
  const { content } = useDiscoverFilters();
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
      maxWidth="full"
      shouldHideOnScroll={false}
      isBordered={false}
      classNames={{ 
        wrapper: "px-2 md:px-4",
      }}
      className={cn(
        "fixed top-0 left-0 right-0 w-full h-min z-[9999] transition-all duration-300",
        "bg-black/10 backdrop-blur-md border-b border-white/5"
      )}
      style={{ position: 'fixed', top: 0, left: 0, right: 0 }}
    >
      {y > 100 && (
        <div
          className="absolute inset-0 h-full w-full bg-black/30 backdrop-blur-md transition-opacity duration-300"
          style={{ opacity: Math.min(y / 300, 0.8) }}
        />
      )}
      <NavbarBrand className="relative z-10">
        {show ? <BrandLogo /> : <BackButton href={tv ? "/?content=tv" : "/"} />}
      </NavbarBrand>
      <NavbarContent justify="center" className="relative z-10">
        <NavbarItem>
          <Next
            className={cn("size-6 transition-colors md:size-8", {
              "text-primary": (show && content === "movie") || (!show && !tv),
              "text-warning": (show && content === "tv") || (!show && tv),
            })}
          />
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end" className="relative z-10">
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
