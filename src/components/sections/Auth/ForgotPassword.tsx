import { Mail } from "@/utils/icons";
import { addToast, Button, Input } from "@heroui/react";
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
      <Input
        {...register("email")}
        isInvalid={!!errors.email?.message}
        errorMessage={errors.email?.message}
        isRequired
        label="Email Address"
        placeholder="Enter your email"
        type="email"
        variant="underlined"
        startContent={<Mail className="text-xl" />}
        isDisabled={isPending}
      />
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
