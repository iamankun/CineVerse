import { resetPassword } from "@/actions/auth";
import { ResetPasswordFormSchema, ResetPasswordFormInput } from "@/schemas/auth";
import { LockPassword } from "@/utils/icons";
import { addToast, Button } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm, SubmitHandler } from "react-hook-form";

const AuthResetPasswordForm: React.FC = () => {
  const [isPending, startTransition] = useTransition();

  const {
    watch,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormInput>({
    resolver: zodResolver(ResetPasswordFormSchema),
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<ResetPasswordFormInput> = (data) => {
    startTransition(async () => {
      // Captcha is not needed here as the user is already verified via email link
      const { success, message } = await resetPassword(data);

      addToast({ title: message, color: success ? "success" : "danger" });

      if (success) {
        setTimeout(() => {
          // Redirect to the login page after a successful password reset
          window.location.href = "/auth";
        }, 2000);
      }
    });
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
      <p className="text-small text-foreground-500 mb-4 text-center">
        Please enter your new password
      </p>
      <div className="relative w-full">
        <LockPassword className="absolute left-3 top-1/2 -translate-y-1/2 text-default-400" />
        <input
          placeholder="Mật khẩu mới"
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
          placeholder="Xác nhận mật khẩu mới"
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
        Reset Password
      </Button>
    </form>
  );
};

export default AuthResetPasswordForm;
