import { signIn } from "@/actions/auth";
import PasswordInput from "@/components/ui/input/PasswordInput";
import { LoginFormSchema, LoginFormInput } from "@/schemas/auth";
import { LockPassword, Mail } from "@/utils/icons";
import { addToast, Button, Input, Link } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useCallback, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { AuthFormProps } from "./Forms";
import { useRouter } from "@bprogress/next/app";
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
      if (env.NEXT_PUBLIC_CAPTCHA_SITE_KEY) {
        captchaToken = await handleReCaptchaVerify();
        if (!captchaToken) {
          addToast({ title: "Xác minh Captcha thất bại. Vui lòng thử lại.", color: "danger" });
          return;
        }
      }

      const { success, message } = await signIn({ ...data, captchaToken: captchaToken || undefined });

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
          <Input
            label="Email"
            placeholder="Nhập email của bạn"
            type="email"
            autoComplete="email"
            {...register("email")}
            isInvalid={!!errors.email}
            errorMessage={errors.email?.message}
            isDisabled={isPending}
            startContent={<Mail />}
          />
          <PasswordInput
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            autoComplete="current-password"
            {...register("loginPassword")}
            isInvalid={!!errors.loginPassword}
            errorMessage={errors.loginPassword?.message}
            isDisabled={isPending}
            startContent={<LockPassword />}
          />
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
            Đăng nhập
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
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthLoginForm;
