import { Mail } from "@/utils/icons";
import { addToast, Button } from "@heroui/react";
import { AuthFormProps } from "./Forms";
import { ForgotPasswordFormSchema, ForgotPasswordFormInput } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler, useForm as useFormType } from "react-hook-form";
import { useTransition, useCallback } from "react";
import { sendResetPasswordEmail } from "@/actions/auth";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { env } from "@/utils/env";

const AuthForgotPasswordForm: React.FC<AuthFormProps> = ({ setForm }) => {
  const [isPending, startTransition] = useTransition();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormInput>({
    resolver: zodResolver(ForgotPasswordFormSchema),
    mode: "onChange",
  });

  const handleReCaptchaVerify = useCallback(async () => {
    if (!executeRecaptcha) {
      console.error("ReCaptcha not available");
      return null;
    }
    try {
      const token = await executeRecaptcha("forgot_password");
      return token;
    } catch (error) {
      console.error("ReCaptcha verification error:", error);
      return null;
    }
  }, [executeRecaptcha]);

  const onSubmit: SubmitHandler<ForgotPasswordFormInput> = (data) => {
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

      const { success, message } = await sendResetPasswordEmail({ ...data, captchaToken: captchaToken || undefined });

      addToast({ title: message, color: success ? "success" : "danger" });
    });
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
      <p className="text-small text-foreground-500 mb-4 text-center">
        You'll receive an email with a link to reset your password
      </p>
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
      <Button
        className="mt-3 w-full"
        color="primary"
        type="submit"
        variant="shadow"
        isLoading={isPending}
      >
        Gửi mail cho tôi
      </Button>
    </form>
  );
};

export default AuthForgotPasswordForm;
