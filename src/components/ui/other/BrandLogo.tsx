"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/utils/helpers";
import { Next } from "@/utils/icons";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import { brandLogoConfig } from "@/utils/overlay-config";

export interface BrandLogoProps {
  animate?: boolean;
  className?: string;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ animate = true, className }) => {
  const { content } = useDiscoverFilters();

  // Get logo from config (use custom logo if set, otherwise default)
  const logoSrc = brandLogoConfig.logoPath || "/logo-80.gif";
  const logoWebp = brandLogoConfig.logoPath ? null : "/logo-80.webp";
  const scale = brandLogoConfig.scale || 1;

  // Base size is 32px (h-8 w-8), scaled by config
  const baseSize = 32;
  const mdSize = 40;

  return (
    <Link href="/" className="group">
      {logoWebp ? (
        <picture>
          <source srcSet={logoWebp} type="image/webp" />
          <Image
            src={logoSrc}
            alt="CineVerse Logo"
            width={80}
            height={80}
            className={cn(
              "object-contain transition-opacity group-hover:opacity-80",
              className
            )}
            style={{
              width: `${baseSize * scale}px`,
              height: `${baseSize * scale}px`,
            }}
            priority
            unoptimized
          />
        </picture>
      ) : (
        <Image
          src={logoSrc}
          alt="CineVerse Logo"
          width={80}
          height={80}
          className={cn(
            "object-contain transition-opacity group-hover:opacity-80",
            className
          )}
          style={{
            width: `${baseSize * scale}px`,
            height: `${baseSize * scale}px`,
          }}
          priority
          unoptimized
        />
      )}
    </Link>
  );
};

export default BrandLogo;
