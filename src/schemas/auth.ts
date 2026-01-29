import * as z from "zod";

// reCAPTCHA token validation constants (2024-2025 requirements)
const CAPTCHA_MIN_LENGTH = 300; // Minimum for all reCAPTCHA versions
const CAPTCHA_MAX_LENGTH = 15000; // Support for v3 Enterprise (~12k chars)
const CAPTCHA_MESSAGES = {
  min: "Token captcha không hợp lệ (quá ngắn)",
  max: "Token captcha không hợp lệ (quá dài)"
};

const AuthFormSchema = z.object({
  username: z
    .string()
    .min(3, "Tài khoản cần ít nhất 3 ký tự")
    .max(25, "Tài khoản tối đa 25 ký tự"),
  email: z.email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu cần ít nhất 6 ký tự"),
  loginPassword: z.string().min(1, "Vui lòng nhập mật khẩu"),
  confirm: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  captchaToken: z.string()
    .min(CAPTCHA_MIN_LENGTH, CAPTCHA_MESSAGES.min)
    .max(CAPTCHA_MAX_LENGTH, CAPTCHA_MESSAGES.max)
    .optional(),
});

const RegisterFormSchema = AuthFormSchema.omit({ loginPassword: true }).refine(
  (data) => data.password === data.confirm,
  {
    message: "Mật khẩu chưa đúng nha, oánh lại đi",
    path: ["confirm"],
  },
);

const LoginFormSchema = AuthFormSchema.pick({
  email: true,
  loginPassword: true,
  captchaToken: true,
});

const ForgotPasswordFormSchema = AuthFormSchema.pick({ email: true, captchaToken: true });

const ResetPasswordFormSchema = AuthFormSchema.pick({
  password: true,
  confirm: true,
  captchaToken: true,
}).refine((data) => data.password === data.confirm, {
  message: "Mật khẩu chưa đúng nha, oánh lại đi",
  path: ["confirm"],
});

type AuthFormInput = z.infer<typeof AuthFormSchema>;
type RegisterFormInput = z.infer<typeof RegisterFormSchema>;
type LoginFormInput = z.infer<typeof LoginFormSchema>;
type ForgotPasswordFormInput = z.infer<typeof ForgotPasswordFormSchema>;
type ResetPasswordFormInput = z.infer<typeof ResetPasswordFormSchema>;

export {
  AuthFormSchema,
  RegisterFormSchema,
  LoginFormSchema,
  ForgotPasswordFormSchema,
  ResetPasswordFormSchema,
};

export type {
  AuthFormInput,
  RegisterFormInput,
  LoginFormInput,
  ForgotPasswordFormInput,
  ResetPasswordFormInput,
};
