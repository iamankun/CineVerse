"use client";

import { tmdb } from "@/api/tmdb";
import ThreeDMarquee from "@/components/ui/background/ThreeDMarquee";
import IconButton from "@/components/ui/button/IconButton";
import { cn, isEmpty, shuffleArray } from "@/utils/helpers";
import { ArrowLeft } from "@/utils/icons";
import { getImageUrl } from "@/utils/movies";
import BrandLogo from "@/components/ui/other/BrandLogo";
import { addToast, Card, CardBody, CardHeader, Spinner } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { parseAsBoolean, parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { useEffect, useMemo } from "react";
import Image from "next/image";
import AuthForgotPasswordForm from "./ForgotPassword";
import AuthLoginForm from "./Login";
import AuthRegisterForm from "./Register";
import AuthResetPasswordForm from "./ResetPassword";

const ValidForms = ["login", "register", "forgot"] as const;

export interface AuthFormProps {
  setForm: (form: (typeof ValidForms)[number]) => void;
}

const AuthForms: React.FC = () => {
  const pathname = usePathname();
  const reset = pathname === "/auth/reset-password";

  const [error, setError] = useQueryState("error", parseAsBoolean.withDefault(false));
  const [success, setSuccess] = useQueryState("success", parseAsBoolean.withDefault(false));
  const [message, setMessage] = useQueryState("message", parseAsString.withDefault(""));
  const [form, setForm] = useQueryState(
    "form",
    parseAsStringLiteral(ValidForms).withDefault("login"),
  );

  const { data: movies, isPending: isPendingMovies } = useQuery({
    queryFn: () => tmdb.trending.trending("movie", "day", { language: 'vi-VN' }),
    queryKey: ["movie-auth-posters"],
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });

  const { data: tvShows, isPending: isPendingTv } = useQuery({
    queryFn: () => tmdb.trending.trending("tv", "day", { language: 'vi-VN' }),
    queryKey: ["tv-auth-posters"],
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });

  const IMAGES = useMemo(() => {
    if (!movies?.results || !tvShows?.results) return [];
    
    // Limit to 5 items each for better performance
    const moviePosters = movies.results
      .filter((movie) => movie.poster_path)
      .slice(0, 5)
      .map((movie) => getImageUrl(movie.poster_path, "poster"));
    const tvPosters = tvShows.results
      .filter((show) => show.poster_path)
      .slice(0, 5)
      .map((show) => getImageUrl(show.poster_path, "poster"));
    return shuffleArray([...moviePosters, ...tvPosters]);
  }, [movies?.results, tvShows?.results]);

  useEffect(() => {
    if (error) {
      addToast({
        title: "Xảy ra lỗi bạn ơi. Thử lại xem sao?",
        color: "danger",
      });
      setError(false);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      addToast({
        title: "Đăng nhập thành công! Đang chuyển hướng...",
        color: "success",
      });
      setSuccess(false);
      // Redirect to home after successful login
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    }
  }, [success]);

  useEffect(() => {
    if (message) {
      addToast({
        title: message,
        color: "warning",
      });
      setMessage("");
    }
  }, [message]);

  if (isPendingMovies || isPendingTv) {
    return <Spinner size="lg" className="absolute-center" variant="simple" />;
  }

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
          <CardHeader className="relative flex items-center justify-center">
            {form === "forgot" && (
              <IconButton
                size="md"
                variant="light"
                onClick={() => setForm("login")}
                className="group motion-preset-focus absolute left-2 data-[hover=true]:bg-transparent"
                icon={<ArrowLeft className="text-4xl transition-transform group-hover:scale-125" />}
              />
            )}
            <div className="scale-150">
              <BrandLogo animate={true} />
            </div>
          </CardHeader>
          <AnimatePresence mode="sync">
            <motion.div
              key={form}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
            >
              <CardBody>
                  {reset ? (
                    <AuthResetPasswordForm />
                  ) : (
                    {
                      login: <AuthLoginForm setForm={setForm} />,
                      register: <AuthRegisterForm setForm={setForm} />,
                      forgot: <AuthForgotPasswordForm setForm={setForm} />,
                    }[form]
                  )}
              </CardBody>
            </motion.div>
          </AnimatePresence>
        </Card>
      </div>
      <div className="pointer-events-none absolute inset-0 z-10 h-full w-full bg-black/60 backdrop-blur-[2px] dark:bg-black/20" />
      {!isEmpty(IMAGES) && <ThreeDMarquee className="absolute" images={IMAGES} aspect="poster" />}
    </div>
  );
};

export default AuthForms;
