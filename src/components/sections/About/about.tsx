"use client";

import { DiCode } from "react-icons/di";
import { siteConfig } from "@/config/site";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const FAQ = dynamic(() => import("@/components/sections/About/FAQ"));

const AboutPage = () => {
  return (
    <div className="flex w-full justify-center">
      <div className="flex w-full max-w-2xl flex-col gap-5">
        <Suspense>
          <FAQ />
        </Suspense>
        <Link target="_blank" href={siteConfig.socials.website} className="flex justify-center">
          <DiCode size={30} />
        </Link>
      </div>
    </div>
  );
};

export default AboutPage;
