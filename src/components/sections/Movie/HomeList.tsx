"use client";

import MoviePosterCard from "@/components/sections/Movie/Cards/Poster";
import SectionTitle from "@/components/ui/other/SectionTitle";
import Carousel from "@/components/ui/wrapper/Carousel";
import { QueryList } from "@/types";
import { Skeleton } from "@heroui/react";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import { useQuery } from "@tanstack/react-query";
import { kebabCase } from "string-ts";
import { Movie } from "tmdb-ts/dist/types";
import { IoChevronForward } from "react-icons/io5";

const MovieHomeList: React.FC<QueryList<Movie>> = ({ query, name, param }) => {
  const key = kebabCase(name) + "-list";
  const { ref, inView } = useInView({ triggerOnce: true, initialInView: true });
  const { data, isPending, isError } = useQuery({
    queryFn: query,
    queryKey: [key],
    enabled: inView,
  });

  return (
    <section id={key} className="min-h-[250px] md:min-h-[300px]" ref={ref}>
      {isPending ? (
        <div className="flex w-full flex-col gap-5">
          <div className="flex grow items-center justify-between">
            <Skeleton className="h-7 w-40 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-[250px] rounded-lg md:h-[300px]" />
        </div>
      ) : isError ? (
        <div className="z-3 flex flex-col gap-2">
          <div className="flex grow items-center justify-between">
            <SectionTitle>{name}</SectionTitle>
          </div>
          <p className="text-foreground/50 text-sm">Không thể tải dữ liệu</p>
        </div>
      ) : (
        <div className="z-3 flex flex-col gap-2">
          <div className="flex grow items-center justify-between">
            <SectionTitle>{name}</SectionTitle>
            <Link
              href={`/discover?type=${param}`}
              className="text-foreground bg-default-100 hover:bg-default-200 flex items-center gap-1 rounded-full px-3 py-1 text-sm transition-colors"
            >
              Xem tất cả <IoChevronForward />
            </Link>
          </div>
          <Carousel>
            {data?.results.map((movie) => {
              return (
                <div
                  key={movie.id}
                  className="embla__slide flex min-h-fit max-w-fit items-center px-1 py-2"
                >
                  <MoviePosterCard movie={movie} />
                </div>
              );
            })}
          </Carousel>
        </div>
      )}
    </section>
  );
};

export default MovieHomeList;
