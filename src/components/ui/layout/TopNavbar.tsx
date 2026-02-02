"use client";

import { siteConfig } from "@/config/site";
import { usePathname } from "next/navigation";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react";
import BackButton from "@/components/ui/button/BackButton";
import { useWindowScroll } from "@mantine/hooks";
import ThemeSwitchDropdown from "../input/ThemeSwitchDropdown";
import FullscreenToggleButton from "../button/FullscreenToggleButton";
import GestureControlToggleButton from "../button/GestureControlToggleButton";
import { cn } from "@/utils/helpers";
import BrandLogo from "../other/BrandLogo";
import { UserProfileButton } from "@/components/auth/UserProfileButton";
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

  console.log('🔍 TopNavbar: Rendered, pathname:', pathName, 'show:', show, 'player:', player);

  if (player) return null;

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
        "before:absolute before:inset-0 before:-bottom-8 before:pointer-events-none",
        "before:bg-gradient-to-b before:from-black/50 before:via-black/10 before:to-transparent",
        "before:transition-opacity before:duration-300"
      )}
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0,
        background: 'transparent'
      }}
    >
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
          <GestureControlToggleButton />
          <FullscreenToggleButton />
          <UserProfileButton />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};

export default TopNavbar;
