"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Input, Button, Card, CardHeader, CardBody, Spinner, addToast } from "@heroui/react";
import Image from "next/image";
import BrandLogo from "@/components/ui/other/BrandLogo";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { tmdb } from "@/api/tmdb";
import ThreeDMarquee from "@/components/ui/background/ThreeDMarquee";
import { cn, isEmpty, shuffleArray } from "@/utils/helpers";
import { getImageUrl } from "@/utils/movies";
import { SpacingClasses } from "@/utils/constants";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: movies, isPending: isPendingMovies } = useQuery({
    queryFn: () => tmdb.trending.trending("movie", "day", { language: 'vi-VN' }),
    queryKey: ["movie-auth-posters"],
  });

  const { data: tvShows, isPending: isPendingTv } = useQuery({
    queryFn: () => tmdb.trending.trending("tv", "day", { language: 'vi-VN' }),
    queryKey: ["tv-auth-posters"],
  });

  const IMAGES = useMemo(() => {
    if (!movies?.results || !tvShows?.results) return [];
    const moviePosters = movies.results
      .filter((movie) => movie.poster_path)
      .map((movie) => getImageUrl(movie.poster_path, "poster"));
    const tvPosters = tvShows.results
      .filter((show) => show.poster_path)
      .map((show) => getImageUrl(show.poster_path, "poster"));
    return shuffleArray([...moviePosters, ...tvPosters]);
  }, [movies?.results, tvShows?.results]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        addToast({
          title: "Chào mừng quản trị viên CineVerse",
          description: "Đã quay trở lại!",
          color: "success",
        });
        
        setTimeout(() => {
          router.push("/admin");
          router.refresh();
        }, 1000);
      } else {
        setError("Bạn không phải quản trị viên thì phải? Vui lòng đăng nhập lại nếu chỉ nhầm lẫn.");
        addToast({
          title: "Đăng nhập thất bại",
          description: "Bạn không phải quản trị viên thì phải? Vui lòng đăng nhập lại nếu chỉ nhầm lẫn.",
          color: "danger",
        });
      }
    } catch (err) {
      setError("Đã xảy ra lỗi kết nối. Vui lòng thử lại.");
      addToast({
        title: "Lỗi kết nối",
        description: "Đã xảy ra lỗi kết nối. Vui lòng thử lại.",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isPendingMovies || isPendingTv) {
    return <Spinner size="lg" className="absolute-center" variant="simple" />;
  }

  return (
    <div
      className={cn(
        "relative z-50 flex h-screen w-screen flex-col items-center justify-center overflow-hidden",
        "before:pointer-events-none before:absolute before:inset-0 before:z-20 before:opacity-40 dark:before:opacity-70",
        "dark:before:bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)]",
        "before:bg-[radial-gradient(circle_at_center,transparent_0%,white_100%)]",
        SpacingClasses.reset,
      )}
    >
      <div className="pointer-events-none relative z-50 container mx-auto flex size-full flex-col items-center justify-center p-3">
        <Card
          shadow="lg"
          className="border-foreground-200 bg-background/70 dark:bg-background/80 pointer-events-auto w-full max-w-lg border-2 p-1 backdrop-blur-md md:p-3"
        >
          <CardHeader className="flex flex-col gap-3 px-6 pt-8 items-center">
            <div className="scale-150">
              <BrandLogo animate={true} />
            </div>
          </CardHeader>
          <CardBody className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Tài khoản"
                placeholder="Tài khoản "
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                isRequired
                autoComplete="username"
              />
              <Input
                label="Mật khẩu"
                type="password"
                placeholder="Mật khẩu "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isRequired
                autoComplete="current-password"
              />
              {error && (
                <p className="text-sm text-danger">{error}</p>
              )}
              <Button
                type="submit"
                color="primary"
                isLoading={loading}
                className="w-full"
              >
                Vào hệ thống
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
      <div className="pointer-events-none absolute inset-0 z-10 h-full w-full bg-black/60 backdrop-blur-[2px] dark:bg-black/20" />
      {!isEmpty(IMAGES) && <ThreeDMarquee className="absolute" images={IMAGES} aspect="poster" />}
    </div>
  );
}
