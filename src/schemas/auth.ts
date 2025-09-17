import * as z from "zod";

const AuthFormSchema = z.object({
  username: z
    .string()
    .min(3, "Tài khoản của bạn cần đủ hơn 3 chữ")
    .max(25, "Tài khoản của bạn cần tối thiểu 25 chữ"),
  email: z.email("Địa chỉ Emual của bạn phải có để xác minh"),
  password: z.string().min(5, "Mật khẩu nhớ lưu lại nha đồng chí"),
  loginPassword: z.string(),
  confirm: z.string().min(1, "Xác nhận mật khẩu"),
  captchaToken: z.string().min(500, "Đoạn mã ngắn").max(5000, "Đoạn mã dài").optional(),
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
