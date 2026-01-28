import { resetPassword } from "@/actions/auth";
import RegisterPasswordInput from "@/components/ui/input/RegisterPasswordInput";
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
      <RegisterPasswordInput
        value={watch("password")}
        {...register("password")}
        isInvalid={!!errors.password?.message}
        errorMessage={errors.password?.message}
        isRequired
        variant="underlined"
        label="New Password"
        placeholder="Enter your new password"
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
        label="Confirm New Password"
        placeholder="Confirm your new password"
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
        Reset Password
      </Button>
    </form>
  );
};

export default AuthResetPasswordForm;
