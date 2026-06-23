"use client";

import { Suspense } from "react";
import { Spinner } from "@heroui/spinner";
import { useQuery } from "@tanstack/react-query";
import { getMovieDetails } from "@/api/tmdb";
import { Movie } from "tmdb-ts";
import { Cast } from "tmdb-ts/dist/types/credits";
import { Image } from "tmdb-ts";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
const PhotosSection = dynamic(() => import("@/components/ui/other/PhotosSection"));
const BackdropSection = dynamic(() => import("@/components/sections/Movie/Detail/Backdrop"));
const OverviewSection = dynamic(() => import("@/components/sections/Movie/Detail/Overview"));
const CastsSection = dynamic(() => import("@/components/sections/Movie/Detail/Casts"));
const RelatedSection = dynamic(() => import("@/components/sections/Movie/Detail/Related"));
const CommentsSection = dynamic(() => import("@/components/sections/Movie/Detail/Comments"));

export default function MovieDetailClient({ id, initialData }: { id: number; initialData: Movie }) {
  const {
    data: movie,
    isPending,
    error,
  } = useQuery({
    queryFn: () =>
      getMovieDetails(id, [
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
      ], true),
    queryKey: ["movie-details", id],
    initialData,
  });

  if (isPending) {
    return <Spinner size="lg" className="absolute-center" variant="simple" />;
  }

  if (error) notFound();

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-5 relative z-20">
      <Suspense fallback={<Spinner size="lg" className="absolute-center" variant="simple" />}>
        <div className="flex flex-col gap-10">
          <BackdropSection movie={movie} />
          <div className="mt-8 md:mt-12 lg:mt-16">
            <OverviewSection movie={movie} />
            <CastsSection casts={movie.credits.cast as Cast[]} />
            <PhotosSection images={movie.images.backdrops as Image[]} />
            <div className="relative z-30 mt-10">
              <CommentsSection movieId={id} />
            </div>
            <RelatedSection movie={movie} />
          </div>
        </div>
      </Suspense>
    </div>
  );
}
