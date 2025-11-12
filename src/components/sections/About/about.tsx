"use client";

import { DiCode } from "react-icons/di";
import { siteConfig } from "@/config/site";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { getVersionString } from "@/utils/version";

const FAQ = dynamic(() => import("@/components/sections/About/FAQ"));

const AboutPage = () => {
  return (
    <div className="flex w-full justify-center">
      <div className="flex w-full max-w-2xl flex-col gap-5">
        <Suspense>
          <FAQ />
        </Suspense>
        <div className="flex flex-col items-center gap-2">
          <Link target="_blank" href={siteConfig.socials.website} className="flex justify-center">
            <DiCode size={30} />
          </Link>
          <p className="text-xs text-foreground-500">
            CineVerse {getVersionString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
