import type { Metadata } from "next";
import Script from "next/script";
import { getTvShowDetails } from "@/api/tmdb";
import { generateSEOTitle, generateSEODescription, generateStructuredData } from "@/utils/seo/content-generator";
import TvDetailClient from "./TvDetailClient";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cineverse.ankun.dev";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const tvId = Number(id);
  if (isNaN(tvId)) return {};

  const tv = await getTvShowDetails(tvId, [], false);
  const title = generateSEOTitle(tv);
  const description = generateSEODescription(tv);
  const image = tv.poster_path
    ? `https://image.tmdb.org/t/p/original${tv.poster_path}`
    : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/tv/${tvId}`,
    },
    openGraph: {
      title,
      description,
      type: "video.tv_show",
      images: image ? [{ url: image, width: 1000, height: 1500 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function TvDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tvId = Number(id);
  if (isNaN(tvId)) return null;

  const tv = await getTvShowDetails(tvId, [
    "images",
    "videos",
    "credits",
    "recommendations",
    "similar",
    "reviews",
    "alternative_titles",
    "translations",
    "keywords",
    "content_ratings",
  ], true);

  const url = `${BASE_URL}/tv/${tvId}`;
  const jsonLd = generateStructuredData(tv, url);

  return (
    <>
      <Script
        id="tv-jsonld"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TvDetailClient id={tvId} initialData={tv} />
    </>
  );
}
