import { signUp } from "@/actions/auth";
import { LockPassword, Mail, User } from "@/utils/icons";
import { addToast, Button, Divider, Link } from "@heroui/react";
import { AuthFormProps } from "./Forms";
import { RegisterFormSchema, RegisterFormInput } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { useTransition, useCallback } from "react";
import { env } from "@/utils/env";
import GoogleLoginButton from "@/components/ui/button/GoogleLoginButton";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

const AuthRegisterForm: React.FC<AuthFormProps> = ({ setForm }) => {
  const [isPending, startTransition] = useTransition();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const {
    watch,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormInput>({
    resolver: zodResolver(RegisterFormSchema),
    mode: "onChange",
  });

  const handleReCaptchaVerify = useCallback(async () => {
    if (!executeRecaptcha) {
      console.error("ReCaptcha not available");
      return null;
    }
    try {
      const token = await executeRecaptcha("register");
      return token;
    } catch (error) {
      console.error("ReCaptcha verification error:", error);
      return null;
    }
  }, [executeRecaptcha]);

  const onSubmit: SubmitHandler<RegisterFormInput> = (data) => {
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

      const { success, message } = await signUp({ ...data, captchaToken: captchaToken || undefined });

      addToast({
        title: message,
        color: success ? "success" : "danger",
        timeout: success ? Infinity : undefined,
      });
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
        <p className="text-small text-foreground-500 mb-4 text-center">
          Tham gia để theo dõi phim yêu thích và lịch sử xem phim
        </p>
        <div className="relative w-full">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-default-400" />
          <input
            placeholder="Tên người dùng"
            autoComplete="username"
            {...register("username")}
            disabled={isPending}
            className="w-full rounded-lg bg-default-100 p-3 pl-10 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.username && <p className="mt-1 text-xs text-danger">{errors.username.message}</p>}
        </div>
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
            autoComplete="new-password"
            {...register("password")}
            disabled={isPending}
            className="w-full rounded-lg bg-default-100 p-3 pl-10 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
        </div>
        <div className="relative w-full">
          <LockPassword className="absolute left-3 top-1/2 -translate-y-1/2 text-default-400" />
          <input
            placeholder="Xác nhận mật khẩu"
            type="password"
            autoComplete="new-password"
            {...register("confirm")}
            disabled={isPending}
            className="w-full rounded-lg bg-default-100 p-3 pl-10 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.confirm && <p className="mt-1 text-xs text-danger">{errors.confirm.message}</p>}
        </div>
        <Button
          className="mt-3 w-full"
          color="primary"
          type="submit"
          variant="shadow"
          isLoading={isPending}
        >
          Đăng ký
        </Button>
      </form>
      <div className="flex items-center gap-4 py-2">
        <Divider className="flex-1" />
        <p className="text-tiny text-default-500 shrink-0">OR</p>
        <Divider className="flex-1" />
      </div>
      <GoogleLoginButton isDisabled={isPending} />
      <p className="text-small text-center">
        Already have an account?
        <Link
          isBlock
          onClick={() => setForm("login")}
          size="sm"
          className="cursor-pointer"
          isDisabled={isPending}
        >
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default AuthRegisterForm;
