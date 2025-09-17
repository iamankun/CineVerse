"use client";

import Link from "next/link";
import { Dosis } from "@/utils/fonts";
import { cn } from "@/utils/helpers";
import { Next } from "@/utils/icons";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";

export interface BrandLogoProps {
  animate?: boolean;
  className?: string;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ animate = true, className }) => {
  const { content } = useDiscoverFilters();

  return (
    <Link href="./public/logo.png" className="group">
      <span
        className={cn(
          "flex items-center bg-linear-to-r from-transparent from-80% via-white to-transparent bg-size-[200%_100%] bg-clip-text bg-position-[40%] text-2xl font-semibold text-foreground/60 md:text-3xl",
          "tracking-widest transition-[letter-spacing] group-hover:tracking-[0.2em]",
          {
            "animate-shine": animate,
            "text-foreground": !animate,
          },
          Dosis.className,
          className,
        )}
      >
        Cine{" "}
        <span>
          <Next
            className={cn("size-full px-[2px] transition-colors", {
              "text-primary": content === "movie",
              "text-warning": content === "tv",
            })}
          />
        </span>{" "}
        erse
      </span>
    </Link>
  );
};

export default BrandLogo;
