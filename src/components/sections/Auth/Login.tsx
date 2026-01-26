import { signIn } from "@/actions/auth";
import PasswordInput from "@/components/ui/input/PasswordInput";
import { LoginFormSchema } from "@/schemas/auth";
import { isEmpty } from "@/utils/helpers";
import { Google, LockPassword, Mail } from "@/utils/icons";
import { addToast, Button, Divider, Input, Link } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Turnstile } from "@marsidev/react-turnstile";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { AuthFormProps } from "./Forms";
import { env } from "@/utils/env";
import { useRouter } from "@bprogress/next/app";
import GoogleLoginButton from "@/components/ui/button/GoogleLoginButton";

const AuthLoginForm: React.FC<AuthFormProps> = ({ setForm }) => {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(LoginFormSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      loginPassword: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    console.log("🔄 Đang nổ lực đăng nhập:", { email: data.email, hasCaptcha: !!data.captchaToken });
    
    // If no captcha token and site key is configured, show captcha
    if (env.NEXT_PUBLIC_CAPTCHA_SITE_KEY && !data.captchaToken) {
      console.log("🔄 Hiển thị captcha");
      setIsVerifying(true);
      return;
    }
    
    // Proceed with login
    const { success, message } = await signIn(data);

    addToast({
      title: message,
      color: success ? "success" : "danger",
    });

    if (!success) {
      setValue("captchaToken", undefined);
      setIsVerifying(false);
      return;
    }

    return router.push("/");
  });

  const onCaptchaSuccess = useCallback(
    (token: string) => {
      console.log("✅ Captcha thành công:", { token: token.substring(0, 10) + "..." });
      setValue("captchaToken", token);
      setIsVerifying(false);
      
      // Trigger form submission after captcha success
      setTimeout(() => {
        const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
        if (submitButton) submitButton.click();
      }, 100);
    },
    [setValue, setIsVerifying],
  );

  const getButtonText = useCallback(() => {
    if (isSubmitting) return "Đang đăng nhập...";
    if (isVerifying) return "Đang xác minh...";
    return "Đăng nhập";
  }, [isSubmitting, isVerifying]);

  return (
    <div className="flex flex-col gap-5">
      <form className="flex flex-col gap-3" onSubmit={onSubmit}>
        <p className="text-small text-foreground-500 mb-4 text-center">
          Đăng nhập để hành trình xem phim thoải mái hơn
        </p>
        <Input
          {...register("email")}
          isInvalid={!!errors.email?.message}
          errorMessage={errors.email?.message}
          isRequired
          spellCheck="false"
          autoComplete="email"
          label="Nhập email đi bạn"
          placeholder="Nhập email đi bạn"
          type="email"
          variant="underlined"
          startContent={<Mail className="text-xl" />}
          isDisabled={isSubmitting || isVerifying}
        />
        <PasswordInput
          {...register("loginPassword")}
          isInvalid={!!errors.loginPassword?.message}
          errorMessage={errors.loginPassword?.message}
          isRequired
          variant="underlined"
          label="Mật khẩu"
          placeholder="Nhập mật khẩu đi bạn"
          startContent={<LockPassword className="text-xl" />}
          isDisabled={isSubmitting || isVerifying}
        />
        <div className="flex w-full items-center justify-end px-1 py-2">
          <Link
            size="sm"
            className="text-foreground cursor-pointer"
            onClick={() => setForm("forgot")}
            isDisabled={isSubmitting || isVerifying}
          >
            Forgot password?
          </Link>
        </div>
        {isVerifying && env.NEXT_PUBLIC_CAPTCHA_SITE_KEY && (
          <div className="relative">
            <Turnstile
              className="flex h-fit w-full items-center justify-center"
              siteKey={env.NEXT_PUBLIC_CAPTCHA_SITE_KEY}
              onSuccess={onCaptchaSuccess}
              onError={(error: any) => {
                console.error("❌ Captcha lỗi:", error);
                console.log("🔍 Error type:", typeof error);
                console.log("🔍 Error keys:", error ? Object.keys(error) : 'null');
                
                // Handle 400020 error (tracking prevention) - multiple ways to detect
                let isTrackingPrevention = false;
                
                if (typeof error === 'string' && error.includes('400020')) {
                  isTrackingPrevention = true;
                } else if (error?.code === '400020' || error?.code === 400020) {
                  isTrackingPrevention = true;
                } else if (error?.message?.includes('400020')) {
                  isTrackingPrevention = true;
                } else if (error?.toString()?.includes('400020')) {
                  isTrackingPrevention = true;
                }
                
                if (isTrackingPrevention) {
                  console.log("⚠️ Phát hiện theo dõi - Tiếp tục không cần captcha.");
                  setIsVerifying(false);
                  setValue("captchaToken", "bypass"); // Set bypass token
                  
                  // Trigger form submission after bypass
                  setTimeout(() => {
                    const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
                    if (submitButton) submitButton.click();
                  }, 100);
                  return;
                }
                
                // Handle other captcha errors
                setIsVerifying(false);
                setValue("captchaToken", undefined);
                addToast({
                  title: "Captcha xác minh lỗi. Vui lòng thử lại.",
                  color: "danger",
                });
              }}
              onExpire={() => {
                console.log("⏰ Captcha hết hạn");
                setIsVerifying(false);
                setValue("captchaToken", undefined);
              }}
              onBeforeInteractive={() => {
                console.log("🔄 Captcha đang tải...");
              }}
              onAfterInteractive={() => {
                console.log("✅ Captcha sẵn sàng");
              }}
              onLoad={() => {
                console.log("📦 Captcha loaded");
              }}
              onTimeout={() => {
                console.log("⏱️ Captcha timeout - proceeding without captcha");
                setIsVerifying(false);
                setValue("captchaToken", "bypass");
                setTimeout(() => {
                  const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
                  if (submitButton) submitButton.click();
                }, 100);
              }}
            />
            
            {/* Fallback button if captcha fails to load */}
            <button
              type="button"
              className="absolute top-2 right-2 text-xs text-danger hover:underline"
              onClick={() => {
                console.log("⚠️ Manual bypass triggered");
                setIsVerifying(false);
                setValue("captchaToken", "bypass");
                setTimeout(() => {
                  const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
                  if (submitButton) submitButton.click();
                }, 100);
              }}
            >
              Bỏ qua captcha
            </button>
          </div>
        )}
        <Button
          className="mt-4"
          color="primary"
          type="submit"
          variant="shadow"
          isLoading={isSubmitting || isVerifying}
        >
          {getButtonText()}
        </Button>
      </form>
      <div className="flex items-center gap-4">
        <Divider className="flex-1" />
        <p className="text-tiny text-default-500 shrink-0">OR</p>
        <Divider className="flex-1" />
      </div>
      <GoogleLoginButton isDisabled={isSubmitting || isVerifying} />
      <p className="text-small text-center">
        Bạn cần tài khoản?
        <Link
          isBlock
          size="sm"
          className="cursor-pointer"
          onClick={() => setForm("register")}
          isDisabled={isSubmitting || isVerifying}
        >
          Đăng ký
        </Link>
      </p>
    </div>
  );
};

export default AuthLoginForm;
