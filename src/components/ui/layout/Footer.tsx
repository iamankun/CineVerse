"use client";

import BrandLogo from "@/components/ui/other/BrandLogo";
import { siteConfig } from "@/config/site";
import { cn } from "@/utils/helpers";
import { Link } from "@heroui/react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { FaFacebook, FaYoutube, FaGithub } from "react-icons/fa";
import { IoMail } from "react-icons/io5";
import { clearAllCache, reloadAfterCacheClear } from "@/utils/cache";
import { useState } from "react";
import { getVersionString } from "@/utils/version";

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  const pathName = usePathname();
  const currentYear = new Date().getFullYear();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearCache = async () => {
    if (isClearing) return;

    setIsClearing(true);

    try {
      const result = await clearAllCache();

      if (result.success) {
        // Hiển thị thông báo thành công
        console.log("✅", result.message);
        if (result.details && result.details.length > 0) {
          console.log("Chi tiết:", result.details);
        }

        // Reload trang sau 1 giây
        reloadAfterCacheClear(1000);
      } else {
        console.error("❌", result.message);
        alert(result.message);
        setIsClearing(false);
      }
    } catch (error) {
      console.error("Clear cache error:", error);
      alert("Có lỗi khi làm mới cache");
      setIsClearing(false);
    }
  };

  return (
    <footer
      className={cn(
        "relative w-full border-t border-divider bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 pb-safe-bottom-nav",
        className,
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <button
              onClick={handleClearCache}
              disabled={isClearing}
              type="button"
              className="mb-4 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer select-auto"
              title="Click để làm mới toàn bộ cache"
              aria-label="Làm mới cache"
            >
              <div className="scale-150 pointer-events-none">
                <BrandLogo />
              </div>
            </button>
            <p className="mb-4 text-sm text-foreground-600">
              {siteConfig.description}
            </p>
            <p className="text-xs text-foreground-500">
              Nền tảng xem phim trực tuyến với hàng ngàn bộ phim và chương trình TV chất lượng cao. 
              Trải nghiệm giải trí không giới hạn cùng CineVerse.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h4 className="mb-4 text-lg font-semibold text-foreground">Liên kết nhanh</h4>
            <ul className="space-y-2">
              {siteConfig.navItems.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    color={pathName === href ? "warning" : "foreground"}
                    className="text-sm transition-colors hover:text-warning"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Contact */}
          <div className="col-span-1">
            <h4 className="mb-4 text-lg font-semibold text-foreground">Kết nối</h4>
            <div className="flex flex-col gap-3">
              <Link
                isExternal
                href={siteConfig.socials.facebook}
                className="flex items-center gap-2 text-sm text-foreground transition-colors hover:text-warning"
              >
                <FaFacebook size={20} />
                <span>Facebook</span>
              </Link>
              <Link
                isExternal
                href={siteConfig.socials.youtube}
                className="flex items-center gap-2 text-sm text-foreground transition-colors hover:text-warning"
              >
                <FaYoutube size={20} />
                <span>YouTube</span>
              </Link>
              <Link
                isExternal
                href="https://github.com/iamankun/CineVerse"
                className="flex items-center gap-2 text-sm text-foreground transition-colors hover:text-warning"
              >
                <FaGithub size={20} />
                <span>GitHub</span>
              </Link>
              <Link
                href="mailto:contact@ankun.dev"
                className="flex items-center gap-2 text-sm text-foreground transition-colors hover:text-warning"
              >
                <IoMail size={20} />
                <span>Liên hệ</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-divider" />

        {/* Bottom Footer */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="text-center text-sm text-foreground-500 md:text-left">
            <p>© {currentYear} An Kun Studio. All rights reserved.</p>
            <p className="mt-1 text-xs">
              Được phát triển bởi{" "}
              <Link
                isExternal
                href={siteConfig.socials.website}
                className="text-warning hover:underline"
              >
                An Kun
              </Link>
              {" "}với ❤️ tại Việt Nam
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-foreground-500">
            <Link href="/about" className="hover:text-warning">
              Giới thiệu
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-warning">
              Chính sách
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-warning">
              Điều khoản
            </Link>
            <span>•</span>
            <p>{getVersionString()}</p>
          </div>
        </div>

        {/* TMDB Attribution */}
        <div className="mt-6 flex items-center gap-2 text-xs text-foreground-400">
          <span>Dữ liệu phim được cung cấp bởi</span>
          <Link
            isExternal
            href="https://www.themoviedb.org"
            className="inline-block transition-opacity hover:opacity-80"
          >
            <Image
              src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
              alt="The Movie Database (TMDB)"
              width={80}
              height={20}
              className="h-5 w-auto"
              style={{ width: 'auto' }}
              loading="lazy"
            />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
