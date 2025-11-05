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
      <picture>
        <source srcSet="/logo-80.webp" type="image/webp" />
        <Image
          src="/logo-80.gif"
          alt="CineVerse Logo"
          width={80}
          height={80}
          className="h-8 w-8 object-contain transition-opacity group-hover:opacity-80 md:h-10 md:w-10"
          priority
        />
      </picture>
    </Link>
  );
};

export default BrandLogo;
