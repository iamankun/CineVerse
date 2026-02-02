"use client";

import { getWatchlist, removeAllWatchlist } from "@/actions/library";
import { queryClient } from "@/app/providers";
import BackToTopButton from "@/components/ui/button/BackToTopButton";
import ContentTypeSelection from "@/components/ui/other/ContentTypeSelection";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import useSupabaseUser from "@/hooks/useSupabaseUser";
import { isEmpty } from "@/utils/helpers";
import { Trash } from "@/utils/icons";
import { addToast, Button, Select, SelectItem, Spinner } from "@heroui/react";
import { useDisclosure, useInViewport } from "@mantine/hooks";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { Suspense, useEffect, useMemo, useState, useTransition } from "react";
import MoviePosterCard from "../Movie/Cards/Poster";
import TvShowPosterCard from "../TV/Cards/Poster";
import { getLoadingLabel } from "@/utils/movies";
import { ITEMS_PER_PAGE } from "@/utils/constants";
import ConfirmationModal from "@/components/ui/overlay/ConfirmationModal";

type SortOption = "title" | "release_date" | "vote_average" | "created_at";
type FilterType = "movie" | "tv" | "all";

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: "title", label: "Tiêu đề" },
  { key: "release_date", label: "Ngày phát hành" },
  { key: "vote_average", label: "Xếp hạng" },
  { key: "created_at", label: "Ngày thêm" },
];

const LibraryList = () => {
  const { ref, inViewport } = useInViewport();
  const { content } = useDiscoverFilters();
  const { data: user, isLoading: isUserLoading } = useSupabaseUser();
  const [isPending, startTransition] = useTransition();
  const [sortOption, setSortOption] = useState<SortOption>("created_at");
  const [opened, { open, close }] = useDisclosure(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, refetch } =
    useInfiniteQuery({
      queryKey: ["watchlist", content, user?.id],
      queryFn: async ({ pageParam = 1 }) => {
        if (!user) return { success: true, data: [], hasNextPage: false };
        return await getWatchlist(content as FilterType, pageParam, ITEMS_PER_PAGE);
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.hasNextPage) {
          return pages.length + 1;
        }
        return undefined;
      },
      enabled: !isUserLoading,
      staleTime: 1000 * 60 * 5,
    });

  useEffect(() => {
    if (inViewport && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inViewport]);

  const clearWatchlistMutation = useMutation({
    mutationFn: async (type: "movie" | "tv") => {
      if (!user) throw new Error("Người dùng chưa xác thực");
      const result = await removeAllWatchlist(type);
      if (!result.success) {
        throw new Error(result.error || "Không thể xóa danh sách theo dõi");
      }
      const allItems = data?.pages.flatMap((page) => page.data || []) || [];
      const count = allItems.filter((item) => item.type === type).length;
      return { type, count };
    },
    onSuccess: ({ type, count }) => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });

      addToast({
        title: `Đã xóa ${count} ${type === "movie" ? "Điện Ảnh" : "Chương Trình TV"} khỏi danh sách theo dõi!`,
        color: "success",
        icon: <Trash />,
      });

      close();
    },
    onError: (error) => {
      addToast({
        title: "Lỗi",
        description: "Xảy ra lỗi trong quá trình dọn dẹp. Vui lòng thử lại",
        color: "danger",
      });
      console.error("Lỗi dọn dẹp danh sách xem:", error);
    },
  });

  const sortedWatchlist = useMemo(() => {
    if (!data?.pages) return [];

    const allItems = data.pages.flatMap((page) => page.data || []);

    return [...allItems].sort((a, b) => {
      switch (sortOption) {
        case "vote_average":
        case "release_date":
          return b[sortOption] > a[sortOption] ? 1 : -1;
        case "created_at":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "title":
        default:
          return a.title.localeCompare(b.title);
      }
    });
  }, [data?.pages, sortOption]);

  const confirmClearWatchlist = () => {
    startTransition(() => {
      clearWatchlistMutation.mutate(content);
    });
  };

  if (status === "error") {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-danger">Không thể tải danh sách theo dõi</p>
        <Button color="primary" onPress={() => refetch()}>
          Thử lại
        </Button>
      </div>
    );
  }

  const hasItems = !isEmpty(sortedWatchlist);

  return (
    <>
      <div className="relative flex flex-col items-center justify-center gap-10 mt-8 pt-20">
        <div className="flex w-full flex-col items-center justify-center gap-2">
          <ContentTypeSelection className="justify-center" />
          <Select
            label="Sắp xếp theo"
            size="sm"
            placeholder="Chọn cách sắp xếp"
            className="max-w-xs p-4"
            selectedKeys={[sortOption]}
            onChange={({ target }) => setSortOption(target.value as SortOption)}
          >
            {SORT_OPTIONS.map(({ key, label }) => (
              <SelectItem key={key}>{label}</SelectItem>
            ))}
          </Select>
          {hasItems && (
            <Button
              startContent={<Trash />}
              color="danger"
              variant="shadow"
              onPress={() => {
                if (user) open();
              }}
              isLoading={clearWatchlistMutation.isPending || isPending}
            >
              Dọn kho {content === "movie" ? "Điện Ảnh" : "Chương trình TV"} từ danh sách xem của nhà ngươi?
            </Button>
          )}
        </div>
        {status === "pending" ? (
          <Spinner
            size="lg"
            variant="simple"
            className="absolute-center mt-[30vh]"
            color={content === "movie" ? "primary" : "warning"}
          />
        ) : hasItems ? (
          <>
            <div className="movie-grid">
              {sortedWatchlist.map((data) => {
                if (data.type === "tv") {
                  return (
                    <Suspense key={`tv-${data.id}`}>
                      <TvShowPosterCard
                        variant="bordered"
                        // @ts-expect-error: Type conversion for compatibility
                        tv={{
                          adult: data.adult,
                          backdrop_path: data.backdrop_path,
                          first_air_date: data.release_date,
                          id: data.id,
                          name: data.title,
                          poster_path: data.poster_path || "",
                          vote_average: data.vote_average,
                        }}
                      />
                    </Suspense>
                  );
                }
                return (
                  <Suspense key={`movie-${data.id}`}>
                    <MoviePosterCard
                      variant="bordered"
                      // @ts-expect-error: Type conversion for compatibility
                      movie={{
                        adult: data.adult,
                        backdrop_path: data.backdrop_path,
                        id: data.id,
                        poster_path: data.poster_path || "",
                        release_date: data.release_date,
                        title: data.title,
                        vote_average: data.vote_average,
                      }}
                    />
                  </Suspense>
                );
              })}
            </div>
            <div ref={ref} className="flex h-24 items-center justify-center">
              {isFetchingNextPage && (
                <Spinner
                  size="lg"
                  variant="wave"
                  label={getLoadingLabel()}
                  color={content === "movie" ? "primary" : "warning"}
                />
              )}
              {!hasNextPage && !isFetchingNextPage && sortedWatchlist.length > 0 && (
                <p className="text-muted-foreground text-center text-base">
                  Bạn đã xem hết danh sách theo dõi.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex h-[30vh] items-center justify-center">
            <p className="text-default-500">
              Không có {content === "movie" ? "Điện Ảnh" : "Chương Trình TV"} trong danh sách của bạn rồi
            </p>
          </div>
        )}
      </div>

      <BackToTopButton />

      <ConfirmationModal
        title={`Dọn dẹp danh sách ${content === "movie" ? "Điện Ảnh" : "Chương Trình TV"}?`}
        isOpen={opened}
        onClose={close}
        onConfirm={confirmClearWatchlist}
        confirmLabel="Dọn tất cả"
        isLoading={clearWatchlistMutation.isPending}
      >
        <p>
          Bạn có muốn xóa bỏ toàn bộ danh sách xem của mình {content === "movie" ? "Điện Ảnh" : "Chương Trình TV"} từ
          danh sách xem. Thực hiện hành động nếu muốn.
        </p>
        <p className="text-default-500 text-sm">
          {sortedWatchlist.length} {sortedWatchlist.length === 1 ? "item" : "Điện Ảnh hoặc Chương Trình TV"} đã gỡ bỏ rồi nha
        </p>
      </ConfirmationModal>
    </>
  );
};

export default LibraryList;
