"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/utils/helpers";
import { brandLogoConfig } from "@/utils/overlay-config";

export interface BrandLogoProps {
  className?: string;
  animate?: boolean;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ className, animate }) => {

  // Get logo from config (use custom logo if set, otherwise default)
  const logoSrc = brandLogoConfig.logoPath || "/logo-cineverse.png";
  const logoWebp = brandLogoConfig.logoPath ? null : "/logo-cineverse.webp";
  const scale = brandLogoConfig.scale || 1;

  // Base size: 24px for mobile, 32px for desktop
  const mobileSize = 24;
  const desktopSize = 32;

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
              animate && "animate-pulse",
              className
            )}
            style={{
              width: `${mobileSize * scale}px`,
              height: `${mobileSize * scale}px`,
            }}
            priority
            fetchPriority="high"
            unoptimized
          />
          <style jsx>{`
            @media (min-width: 768px) {
              img {
                width: ${desktopSize * scale}px !important;
                height: ${desktopSize * scale}px !important;
              }
            }
          `}</style>
        </picture>
      ) : (
        <>
          <Image
            src={logoSrc}
            alt="CineVerse Logo"
            width={80}
            height={80}
            className={cn(
              "object-contain transition-opacity group-hover:opacity-80",
              animate && "animate-pulse",
              className
            )}
            style={{
              width: `${mobileSize * scale}px`,
              height: `${mobileSize * scale}px`,
            }}
            priority
            fetchPriority="high"
            unoptimized
          />
          <style jsx>{`
            @media (min-width: 768px) {
              img {
                width: ${desktopSize * scale}px !important;
                height: ${desktopSize * scale}px !important;
              }
            }
          `}</style>
        </>
      )}
    </Link>
  );
};

export default BrandLogo;
