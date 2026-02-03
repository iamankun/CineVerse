"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Input, Button, Card, CardHeader, CardBody, addToast } from "@heroui/react";
import BrandLogo from "@/components/ui/other/BrandLogo";
import ThreeDMarquee from "@/components/ui/background/ThreeDMarquee";
import { cn, isEmpty, shuffleArray } from "@/utils/helpers";
import { getImageUrl } from "@/utils/movies";
import { useQuery } from "@tanstack/react-query";
import { tmdb } from "@/api/tmdb";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Fetch trending movies for background
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

  if (isPendingMovies || isPendingTv) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-t-transparent"></div>
          <p className="text-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const supabase = createClient();
    setIsLoading(true);

    try {
      console.log('🔐 Login attempt:', { email, hasPassword: !!password });
      console.log('🔑 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('🔑 Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('📊 Supabase response:', { data, error });
      
      if (error) {
        console.error('❌ Login error:', error);
        
        // Check specific error types
        if (error.message?.includes('Invalid login credentials')) {
          // Check if user exists
          const { data: user } = await supabase.auth.getUser();
          console.log('👤 Current user:', user);
          
          if (!user) {
            setError('Tài khoản không tồn tại. Vui lòng đăng ký trước.');
            throw new Error('Tài khoản không tồn tại. Vui lòng đăng ký trước.');
          }
          
          // Check if email is verified
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user?.email_confirmed_at === null) {
            setError('Email chưa được xác minh. Vui lòng kiểm tra hộp thư.');
            throw new Error('Email chưa được xác minh. Vui lòng kiểm tra hộp thư.');
          }
          
          setError('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
          throw new Error('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
        }
        
        setError(error.message);
        throw error;
      }
      
      addToast({
        title: "Đăng nhập thành công!",
        color: "success",
      });
      
      router.push("/");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Đăng nhập thất bại";
      if (!error) setError(errorMessage);
      
      addToast({
        title: errorMessage,
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "relative z-50 flex h-screen w-screen flex-col items-center justify-center overflow-hidden m-0 p-0",
        "before:pointer-events-none before:absolute before:inset-0 before:z-20 before:opacity-40 dark:before:opacity-70",
        "dark:before:bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)]",
        "before:bg-[radial-gradient(circle_at_center,transparent_0%,white_100%)]",
        "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
      )}
    >
      <div className="pointer-events-none relative z-50 container mx-auto flex size-full flex-col items-center justify-center p-3">
        <Card
          shadow="none"
          className="border-foreground-200 bg-background/70 dark:bg-background/80 pointer-events-auto w-full max-w-lg border-2 p-1 backdrop-blur-md md:p-3"
        >
          <CardHeader className="flex flex-col gap-3 px-6 pt-8 items-center">
            <div className="scale-150">
              <BrandLogo animate={true} />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Đăng Nhập
            </h1>
            <p className="text-sm text-foreground/60">
              Chào mừng đến với CineVerse
            </p>
          </CardHeader>
          <CardBody className="px-6 pb-6">
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <Input
                label="Email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isRequired
                autoComplete="email"
                type="email"
              />
              <Input
                label="Mật khẩu"
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isRequired
                autoComplete="current-password"
              />
              {error && (
                <div className="rounded-lg bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 p-3">
                  <p className="text-sm text-danger font-medium">{error}</p>
                </div>
              )}
              <Button
                type="submit"
                color="primary"
                isLoading={isLoading}
                className="w-full"
              >
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-foreground/60">
                Chưa có tài khoản?{" "}
                <button
                  onClick={() => router.push("/auth/sign-up")}
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Đăng ký ngay
                </button>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
      <div className="pointer-events-none absolute inset-0 z-10 h-full w-full bg-black/60 backdrop-blur-[2px] dark:bg-black/20" />
      {!isEmpty(IMAGES) && <ThreeDMarquee className="absolute" images={IMAGES} aspect="poster" />}
    </div>
  );
}
