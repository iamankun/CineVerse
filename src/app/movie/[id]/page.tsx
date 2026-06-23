import type { Metadata } from "next";
import Script from "next/script";
import { getMovieDetails } from "@/api/tmdb";
import { generateSEOTitle, generateSEODescription, generateStructuredData } from "@/utils/seo/content-generator";
import MovieDetailClient from "./MovieDetailClient";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cineverse.ankun.dev";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const movieId = Number(id);
  if (isNaN(movieId)) return {};

  const movie = await getMovieDetails(movieId, [], false);
  const title = generateSEOTitle(movie);
  const description = generateSEODescription(movie);
  const image = movie.poster_path
    ? `https://image.tmdb.org/t/p/original${movie.poster_path}`
    : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/movie/${movieId}`,
    },
    openGraph: {
      title,
      description,
      type: "video.movie",
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

export default async function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const movieId = Number(id);
  if (isNaN(movieId)) return null;

  const movie = await getMovieDetails(movieId, [
    "images",
    "videos",
    "credits",
    "recommendations",
    "similar",
    "reviews",
    "alternative_titles",
    "translations",
    "keywords",
    "release_dates",
  ], true);

  const url = `${BASE_URL}/movie/${movieId}`;
  const jsonLd = generateStructuredData(movie, url);

  return (
    <>
      <Script
        id="movie-jsonld"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MovieDetailClient id={movieId} initialData={movie} />
    </>
  );
}
