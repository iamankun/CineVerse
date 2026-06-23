"use client";

import { Spinner } from "@heroui/react";
import { useScrollIntoView } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { getTvShowDetails } from "@/api/tmdb";
import { TV } from "tmdb-ts";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import dynamic from "next/dynamic";
const PhotosSection = dynamic(() => import("@/components/ui/other/PhotosSection"));
const TvShowRelatedSection = dynamic(() => import("@/components/sections/TV/Details/Related"));
const TvShowCastsSection = dynamic(() => import("@/components/sections/TV/Details/Casts"));
const TvShowBackdropSection = dynamic(() => import("@/components/sections/TV/Details/Backdrop"));
const TvShowOverviewSection = dynamic(() => import("@/components/sections/TV/Details/Overview"));
const TvShowsSeasonsSelection = dynamic(() => import("@/components/sections/TV/Details/Seasons"));

export default function TvDetailClient({ id, initialData }: { id: number; initialData: TV }) {
  const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>({
    duration: 500,
  });

  const {
    data: tv,
    isPending,
    error,
  } = useQuery({
    queryFn: () =>
      getTvShowDetails(id, [
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
      ], true),
    queryKey: ["tv-details", id],
    initialData,
  });

  if (isPending) {
    return (
      <div className="mx-auto max-w-5xl px-3 sm:px-5">
        <Spinner size="lg" className="absolute-center" color="warning" variant="simple" />
      </div>
    );
  }

  if (error) notFound();

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-5">
      <Suspense
        fallback={
          <Spinner size="lg" className="absolute-center" color="warning" variant="simple" />
        }
      >
        <div className="flex flex-col gap-10">
          <TvShowBackdropSection tv={tv} />
          <TvShowOverviewSection
            onViewEpisodesClick={() => scrollIntoView({ alignment: "center" })}
            tv={tv}
          />
          <TvShowCastsSection casts={tv.credits.cast} />
          <PhotosSection images={tv.images.backdrops} type="tv" />
          <TvShowsSeasonsSelection ref={targetRef} id={id} seasons={tv.seasons} />
          <TvShowRelatedSection tv={tv} />
        </div>
      </Suspense>
    </div>
  );
}
