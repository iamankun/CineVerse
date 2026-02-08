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

/**
 * Validate password với cảnh báo tiếng Việt
 */
function validatePassword(password: string): string[] {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("tối thiểu 8 ký tự");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("chứa ít nhất 1 chữ thường");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("chứa ít nhất 1 chữ hoa");
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push("chứa ít nhất 1 số");
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"|<>?,.\/`~]/.test(password)) {
    errors.push("chứa ít nhất 1 ký tự đặc biệt");
  }
  
  return errors;
}

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // 🔥 Get movie images for background (same as LoginForm)
  const { data: movies, isPending: isPendingMovies } = useQuery({
    queryFn: () => tmdb.trending.trending("movie", "day", { language: 'vi-VN' }),
    queryKey: ["movie-auth-posters-signup"],
  });

  const { data: tvShows, isPending: isPendingTv } = useQuery({
    queryFn: () => tmdb.trending.trending("tv", "day", { language: 'vi-VN' }),
    queryKey: ["tv-auth-posters-signup"],
  });

  const IMAGES = useMemo(() => {
    if (!movies?.results || !tvShows?.results) return [];
    const moviePosters = movies.results
      .filter((movie: any) => movie.poster_path)
      .map((movie: any) => getImageUrl(movie.poster_path, "poster"));
    const tvPosters = tvShows.results
      .filter((show: any) => show.poster_path)
      .map((show: any) => getImageUrl(show.poster_path, "poster"));
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      addToast({
        title: "Mật khẩu không khớp",
        color: "danger",
      });
      return;
    }
    
    // 🔥 Password validation với cảnh báo tiếng Việt
    const passwordErrors = validatePassword(password);
    
    if (passwordErrors.length > 0) {
      addToast({
        title: "Mật khẩu không đủ mạnh",
        description: passwordErrors.join(" "),
        color: "danger",
      });
      return;
    }
    
    const supabase = createClient();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: email.split('@')[0],
            username: email.split('@')[0],
          }
        }
      });
      
      console.log('🔍 [SIGNUP] Supabase response:', { data, error });
      
      if (error) {
        console.error('❌ [SIGNUP] Error:', error);
        throw error;
      }
      
      addToast({
        title: "Đăng ký thành công! Vui lòng kiểm tra email để xác minh.",
        color: "success",
      });
      
      // Kiểm tra xem có cần xác minh email không
      if (data?.user?.email_confirmed_at) {
        console.log('✅ [SIGNUP] Email đã xác minh, chuyển đến login');
        router.push("/auth/login");
      } else {
        console.log('⏳ [SIGNUP] Email cần xác minh, chuyển đến login');
        router.push("/auth/login?message=please_verify_email");
      }
    } catch (error: unknown) {
      addToast({
        title: error instanceof Error ? error.message : "Đăng ký thất bại",
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
      <ThreeDMarquee images={[]} />
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
              Đăng Ký
            </h1>
            <p className="text-sm text-foreground/60">
              Tạo tài khoản để bắt đầu hành trình điện ảnh
            </p>
          </CardHeader>
          <CardBody className="px-6 pb-6">
            <form onSubmit={handleSignUp} className="flex flex-col gap-4">
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
                type="password"
                label="Mật khẩu"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isRequired
                autoComplete="new-password"
              />
              
              {/* 🔥 Password Requirements Display */}
              {password && (
                <div className="p-3 bg-background/50 rounded-lg border border-foreground/200">
                  <p className="text-xs text-foreground/60 mb-2">Mật khẩu phải có:</p>
                  <div className="space-y-1">
                    <div className={`text-xs flex items-center gap-2 ${
                      password.length >= 8 ? 'text-success' : 'text-foreground/40'
                    }`}>
                      <span>{password.length >= 8 ? '✓' : '○'}</span>
                      Tối thiểu 8 ký tự
                    </div>
                    <div className={`text-xs flex items-center gap-2 ${
                      /[a-z]/.test(password) ? 'text-success' : 'text-foreground/40'
                    }`}>
                      <span>{/[a-z]/.test(password) ? '✓' : '○'}</span>
                      Ít nhất 1 chữ thường (a-z)
                    </div>
                    <div className={`text-xs flex items-center gap-2 ${
                      /[A-Z]/.test(password) ? 'text-success' : 'text-foreground/40'
                    }`}>
                      <span>{/[A-Z]/.test(password) ? '✓' : '○'}</span>
                      Ít nhất 1 chữ hoa (A-Z)
                    </div>
                    <div className={`text-xs flex items-center gap-2 ${
                      /[0-9]/.test(password) ? 'text-success' : 'text-foreground/40'
                    }`}>
                      <span>{/[0-9]/.test(password) ? '✓' : '○'}</span>
                      Ít nhất 1 số (0-9)
                    </div>
                    <div className={`text-xs flex items-center gap-2 ${
                      /[!@#$%^&*()_+\-=\[\]{};':"|<>?,.\/`~]/.test(password) ? 'text-success' : 'text-foreground/40'
                    }`}>
                      <span>{/[!@#$%^&*()_+\-=\[\]{};':"|<>?,.\/`~]/.test(password) ? '✓' : '○'}</span>
                      Ít nhất 1 ký tự đặc biệt (!@#$%^&*)
                    </div>
                  </div>
                </div>
              )}
              
              <Input
                type="password"
                label="Xác nhận mật khẩu"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                isRequired
                autoComplete="new-password"
              />
              
              <Button
                type="submit"
                color="primary"
                isLoading={isLoading}
                className="w-full"
              >
                {isLoading ? "Đang đăng ký..." : "Đăng ký"}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-foreground/60">
                Đã có tài khoản?{" "}
                <button
                  onClick={() => router.push("/auth/login")}
                  className="text-primary hover:text-primary/80 underline"
                >
                  Đăng nhập ngay
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
