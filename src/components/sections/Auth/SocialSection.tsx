"use client";

import { Divider } from "@heroui/react";
import SocialAuth from "@/components/ui/social/SocialAuth";

const SocialSection: React.FC = () => {
  return (
    <div className="w-full space-y-6">
      {/* Social Auth Buttons */}
      <div className="space-y-3">
        <SocialAuth />
      </div>

      {/* Divider */}
      <div className="relative">
        <Divider className="my-4" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-background px-2 text-xs text-gray-500 dark:text-gray-400">
            HOẶC
          </span>
        </div>
      </div>
    </div>
  );
};

export default SocialSection;
