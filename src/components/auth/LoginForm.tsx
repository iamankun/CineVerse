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
import { tmdb, fetchWithFallback } from "@/api/tmdb";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  // 🔥 Get redirectTo parameter from URL
  const redirectTo = useMemo(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirectTo');
      // Decode URL encoded parameter
      return redirect ? decodeURIComponent(redirect) : '/';
    }
    return '/';
  }, []); // Empty dependency array is fine for URL params

  // Fetch trending movies for background
  const { data: movies, isPending: isPendingMovies } = useQuery({
    queryFn: () => fetchWithFallback(
      () => tmdb.trending.trending("movie", "day", { language: 'vi-VN' }),
      () => tmdb.trending.trending("movie", "day", { language: 'en-US' }),
    ),
    queryKey: ["movie-auth-posters"],
  });

  const { data: tvShows, isPending: isPendingTv } = useQuery({
    queryFn: () => fetchWithFallback(
      () => tmdb.trending.trending("tv", "day", { language: 'vi-VN' }),
      () => tmdb.trending.trending("tv", "day", { language: 'en-US' }),
    ),
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
    
    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log('� [ĐĂNG NHẬP] Bắt đầu đăng nhập:', { email: email.substring(0, 10) + '...' });
      console.log('🔑 [ĐĂNG NHẬP] Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Email không hợp lệ. Vui lòng kiểm tra lại.");
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });
      
      console.log('📊 [ĐĂNG NHẬP] Phản hồi Supabase:', { data, error });
      
      if (error) {
        console.error('❌ [ĐĂNG NHẬP] Lỗi đăng nhập:', error);
        
        // Handle specific error types with better messages
        if (error.message?.includes('Invalid login credentials')) {
          // Try to get more specific error info
          try {
            const { data: user } = await supabase.auth.getUser();
            console.log('👤 [ĐĂNG NHẬP] User sau khi đăng nhập thất bại:', user);
            
            if (!user) {
              setError('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
            } else {
              setError('Mật khẩu không đúng. Vui lòng kiểm tra lại.');
            }
          } catch (userCheckError) {
            console.error('❌ [ĐĂNG NHẬP] Kiểm tra user thất bại:', userCheckError);
            setError('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
          }
        } else if (error.message?.includes('Email not confirmed')) {
          setError('Email chưa được xác minh. Vui lòng kiểm tra hộp thư và xác minh email.');
        } else if (error.message?.includes('Too many requests')) {
          setError('Quá nhiều lần thử. Vui lòng đợi 5 phút và thử lại.');
        } else if (error.message?.includes('User already registered')) {
          setError('Tài khoản đã tồn tại. Vui lòng đăng nhập.');
        } else {
          setError(error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
        }
        throw error;
      }
      
      addToast({
        title: "Đăng nhập thành công!",
        color: "success",
      });
      
      // 🔥 Redirect to intended page or fallback to home
      console.log("🔀 [ĐĂNG NHẬP] Đăng nhập thành công, chuyển hướng đến:", redirectTo);
      
      // Add small delay to ensure toast is shown
      setTimeout(() => {
        router.push(redirectTo);
      }, 500);
    } catch (error: unknown) {
      console.error('❌ [ĐĂNG NHẬP] Lỗi đăng nhập không mong muốn:', error);
      const errorMessage = error instanceof Error ? error.message : "Đăng nhập thất bại. Vui lòng thử lại.";
      setError(errorMessage);
      
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
              <BrandLogo />
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
