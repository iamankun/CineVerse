"use client";

import Link from "next/link";
import Image from "next/image";
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
    <Link href="/" className="group">
      <span className={cn("flex items-center gap-2", className)}>
        <Next
          className={cn("size-6 transition-colors md:size-8", {
            "text-primary": content === "movie",
            "text-warning": content === "tv",
          })}
        />
        <Image
          src="/logo.gif"
          alt="CineVerse Logo"
          width={120}
          height={40}
          className="h-auto w-24 object-contain transition-opacity group-hover:opacity-80 md:w-32"
          priority
        />
      </span>
    </Link>
  );
};

export default BrandLogo;
