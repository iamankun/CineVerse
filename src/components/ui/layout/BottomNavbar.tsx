"use client";

import { siteConfig } from "@/config/site";
import clsx from "clsx";
import { Link } from "@heroui/link";
import { usePathname } from "next/navigation";
import { Chip } from "@heroui/chip";

const BottomNavbar = () => {
  const pathName = usePathname();
  const hrefs = siteConfig.navItems.map((item) => item.href);
  const show = hrefs.includes(pathName);

  return (
    show && (
      <>
        <div className="pt-20 md:hidden" />
        <div className="pb-safe-bottom-nav fixed bottom-0 left-0 z-50 block h-fit w-full py-2 md:hidden backdrop-blur-xl backdrop-saturate-150 bg-background/70 border-t border-white/10 shadow-[0_-8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="mx-auto grid h-full max-w-lg grid-cols-5">
            {siteConfig.navItems.map((item) => {
              const isActive = pathName === item.href;
              return (
                <Link
                  href={item.href}
                  key={item.href}
                  className="flex items-center justify-center text-foreground"
                >
                  <div className="flex min-h-[60px] flex-col items-center justify-center gap-0.5">
                    <Chip
                      size="lg"
                      variant={isActive ? "solid" : "light"}
                      classNames={{
                        base: "py-[2px] transition-all",
                        content: "size-full",
                      }}
                    >
                      {isActive ? item.activeIcon : item.icon}
                    </Chip>
                    <p className={clsx("text-[9px] leading-tight text-center max-w-[60px] truncate", { 
                      "font-bold": isActive 
                    })}>
                      {item.label}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </>
    )
  );
};

export default BottomNavbar;
