import { signIn } from "@/actions/auth";
import { LoginFormSchema, LoginFormInput } from "@/schemas/auth";
import { LockPassword, Mail } from "@/utils/icons";
import { addToast, Button, Link } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useCallback, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { AuthFormProps } from "./Forms";
import { useRouter } from "next/navigation";
import SocialSection from "./SocialSection";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { env } from "@/utils/env";

const AuthLoginForm: React.FC<AuthFormProps> = ({ setForm }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormInput>({
    resolver: zodResolver(LoginFormSchema),
    mode: "onChange",
  });

  const handleReCaptchaVerify = useCallback(async () => {
    if (!executeRecaptcha) {
      console.error("ReCaptcha not available");
      return null;
    }
    try {
      const token = await executeRecaptcha("login");
      return token;
    } catch (error) {
      console.error("ReCaptcha verification error:", error);
      return null;
    }
  }, [executeRecaptcha]);

  const onSubmit: SubmitHandler<LoginFormInput> = (data) => {
    startTransition(async () => {
      let captchaToken: string | null = null;
      const isDevelopment = process.env.NODE_ENV === 'development';

      if (env.NEXT_PUBLIC_CAPTCHA_SITE_KEY && !isDevelopment) {
        captchaToken = await handleReCaptchaVerify();
        if (!captchaToken) {
          addToast({ title: "Xác minh Captcha thất bại. Vui lòng thử lại.", color: "danger" });
          return;
        }
      }

      const { success, message } = await signIn({ ...data, captchaToken: captchaToken === null ? undefined : captchaToken });

      addToast({
        title: message,
        color: success ? "success" : "danger",
      });

      if (success) {
        router.push("/");
      }
    });
  };

  return (
    <div className="flex w-full flex-col gap-4 rounded-large bg-content1 px-8 py-6 shadow-small">
      <div className="flex flex-col gap-3">
        <SocialSection />
        
        <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
          <div className="relative w-full">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-default-400" />
            <input
              placeholder="Email"
              type="email"
              autoComplete="email"
              {...register("email")}
              disabled={isPending}
              className="w-full rounded-lg bg-default-100 p-3 pl-10 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
          </div>
          <div className="relative w-full">
            <LockPassword className="absolute left-3 top-1/2 -translate-y-1/2 text-default-400" />
            <input
              placeholder="Mật khẩu"
              type="password"
              autoComplete="current-password"
              {...register("loginPassword")}
              disabled={isPending}
              className="w-full rounded-lg bg-default-100 p-3 pl-10 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.loginPassword && <p className="mt-1 text-xs text-danger">{errors.loginPassword.message}</p>}
          </div>
          <div className="flex w-full items-center justify-end px-1 py-2">
            <Link
              size="sm"
              className="text-foreground cursor-pointer"
              onClick={() => setForm("forgot")}
              isDisabled={isPending}
            >
              Bạn quên mật khẩu hen?
            </Link>
          </div>
          
          <Button
            className="mt-4"
            color="primary"
            type="submit"
            variant="shadow"
            isLoading={isPending}
          >
            Đăng nhập ngay
          </Button>
        </form>
        
        <p className="text-center text-small">
          Chưa có tài khoản?{" "}
          <Link
            size="sm"
            className="cursor-pointer"
            onClick={() => setForm("register")}
            isDisabled={isPending}
          >
            Đăng ký ngay bạn ơi!
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthLoginForm;
