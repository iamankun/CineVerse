import { signUp } from "@/actions/auth";
import { LockPassword, Mail, User } from "@/utils/icons";
import { addToast, Button, Divider, Input, Link } from "@heroui/react";
import { AuthFormProps } from "./Forms";
import { RegisterFormSchema, RegisterFormInput } from "@/schemas/auth";
import RegisterPasswordInput from "@/components/ui/input/RegisterPasswordInput";
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
        <Input
          {...register("username")}
          isInvalid={!!errors.username?.message}
          errorMessage={errors.username?.message}
          isRequired
          spellCheck="false"
          autoComplete="username"
          label="Tên người dùng"
          placeholder="Nhập tên người dùng đi bạn"
          variant="underlined"
          startContent={<User className="text-xl" />}
          isDisabled={isPending}
        />
        <Input
          {...register("email")}
          isInvalid={!!errors.email?.message}
          errorMessage={errors.email?.message}
          spellCheck="false"
          isRequired
          autoComplete="email"
          label="Email"
          placeholder="Nhập email đi bạn"
          type="email"
          variant="underlined"
          startContent={<Mail className="text-xl" />}
          isDisabled={isPending}
        />
        <RegisterPasswordInput
          value={watch("password")}
          {...register("password")}
          isInvalid={!!errors.password?.message}
          errorMessage={errors.password?.message}
          isRequired
          variant="underlined"
          label="Mật khẩu"
          placeholder="Nhập mật khẩu đi bạn"
          startContent={<LockPassword className="text-xl" />}
          isDisabled={isPending}
        />
        <RegisterPasswordInput
          {...register("confirm")}
          isConfirmPassword={true}
          isInvalid={!!errors.confirm?.message}
          errorMessage={errors.confirm?.message}
          isRequired
          variant="underlined"
          label="Xác nhận mật khẩu"
          placeholder="Xác nhận mật khẩu đi bạn"
          startContent={<LockPassword className="text-xl" />}
          isDisabled={isPending}
        />
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
