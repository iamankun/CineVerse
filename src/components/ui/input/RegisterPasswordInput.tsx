import { Check, Close, Eye, EyeOff } from "@/utils/icons";
import { Input, Progress } from "@heroui/react";
import { useDisclosure } from "@mantine/hooks";
import { forwardRef, memo } from "react";
import IconButton from "../button/IconButton";
import { cn } from "@/utils/helpers";

const requirements = [
  { re: /[0-9]/, label: "Includes number" },
  { re: /[a-z]/, label: "Includes lowercase letter" },
  { re: /[A-Z]/, label: "Includes uppercase letter" },
  { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: "Includes special symbol" },
];

const getStrength = (password: string): number => {
  let multiplier = password.length > 7 ? 0 : 1;

  requirements.forEach((requirement) => {
    if (!requirement.re.test(password)) {
      multiplier += 1;
    }
  });

  return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 10);
};

const PasswordRequirement = memo(({ meets, label }: { meets: boolean; label: string }) => {
  return (
    <p className={`mt-1.5 flex items-center text-small ${meets ? "text-success" : "text-danger"}`}>
      {meets ? <Check className="text-xl" /> : <Close className="scale-150 text-xl" />}
      <span className="ml-2.5">{label}</span>
    </p>
  );
});

type RegisterPasswordInputProps = Omit<React.ComponentProps<typeof Input>, "type" | "endContent"> & {
  withStrengthMeter?: boolean;
  isConfirmPassword?: boolean;
};

const RegisterPasswordInput = forwardRef<HTMLInputElement, RegisterPasswordInputProps>(
  ({ withStrengthMeter, isConfirmPassword, ...props }, ref) => {
    const [show, { toggle }] = useDisclosure(false);
    const [meter, { open, close }] = useDisclosure(false);

    const strength = getStrength(props.value || "");
    const color = strength === 100 ? "success" : strength > 50 ? "warning" : "danger";

    const checks = requirements.map((requirement, index) => (
      <PasswordRequirement
        key={index}
        label={requirement.label}
        meets={requirement.re.test((props.value as string) || "")}
      />
    ));

    return (
      <div
        className={cn("relative flex flex-col gap-5", {
          "h-48": meter && withStrengthMeter,
        })}
        onFocusCapture={open}
        onBlurCapture={close}
      >
        <Input
          ref={ref}
          spellCheck="false"
          type={show ? "text" : "password"}
          autoComplete={isConfirmPassword ? "new-password" : "new-password"}
          endContent={
            <IconButton
              size="sm"
              variant="light"
              onPress={toggle}
              icon={show ? <EyeOff className="text-xl" /> : <Eye className="text-xl" />}
            />
          }
          {...props}
        />
        {meter && withStrengthMeter && (
          <div className="mt-2">
            <Progress
              size="sm"
              value={strength}
              color={color}
              className="w-full"
            />
            <p className="mt-2 text-small text-foreground-500">
              Password strength: {strength}%
            </p>
            <div className="mt-2 space-y-1">
              {checks}
            </div>
          </div>
        )}
      </div>
    );
  }
);

RegisterPasswordInput.displayName = "RegisterPasswordInput";

export default RegisterPasswordInput;
