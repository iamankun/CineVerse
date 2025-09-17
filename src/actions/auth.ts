"use server";

import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import {
  ForgotPasswordFormInput,
  ForgotPasswordFormSchema,
  LoginFormInput,
  LoginFormSchema,
  RegisterFormInput,
  RegisterFormSchema,
  ResetPasswordFormInput,
  ResetPasswordFormSchema,
} from "@/schemas/auth";
import { z } from "zod";
import { ActionResponse } from "@/types";

/**
 * A generic type for our authentication actions.
 * @template T The type of the form data.
 * @param data The validated form data.
 * @param supabase The Supabase client instance.
 * @returns An ActionResponse.
 */
type AuthAction<T> = (data: T, supabase: SupabaseClient) => ActionResponse;

/**
 * A higher-order function to create a server action that handles
 * form validation, captcha checks, and Supabase client creation.
 * @template T The type of the form data, which must include an optional captchaToken.
 * @param schema The Zod schema for validation.
 * @param action The core logic of the server action.
 * @returns An async function that serves as the server action.
 */
const createAuthAction = <T extends { captchaToken?: string }>(
  schema: z.ZodSchema<T>,
  action: AuthAction<T>,
  admin?: boolean,
) => {
  return async (formData: T): ActionResponse => {
    const result = schema.safeParse(formData);
    if (!result.success) {
      const message = result.error.issues.map((issue) => issue.message).join(". ");
      return { success: false, message };
    }

    if (!result.data.captchaToken) {
      return { success: false, message: "Captcha is required." };
    }

    try {
      const supabase = await createClient(admin);
      return await action(result.data, supabase);
    } catch (error) {
      // Catch potential unhandled errors in actions
      if (error instanceof Error) {
        return { success: false, message: error.message };
      }
      return { success: false, message: "An unexpected error occurred." };
    }
  };
};

const signInWithEmailAction: AuthAction<LoginFormInput> = async (data, supabase) => {
  const { data: user, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.loginPassword,
    options: {
      captchaToken: data.captchaToken,
    },
  });

  if (error) return { success: false, message: error.message };

  const { data: username, error: usernameError } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.user.id)
    .maybeSingle();

  if (!username) {
    console.error("Username check error:", usernameError);
    return {
      success: false,
      message: `CineVerse báo lỗi. Không thể tọa tài khoản với Email: ${user.user.email}.`,
    };
  }

  return { success: true, message: `Welcome back, ${username.username}` };
};

const signUpAction: AuthAction<RegisterFormInput> = async (data, supabase) => {
  // Check username availability
  const { data: usernameExists, error: usernameError } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", data.username)
    .maybeSingle();

  if (usernameError) {
    console.error("Username check error:", usernameError);
    return { success: false, message: "CineVerse báo lỗi. Tài khoản không khớp." };
  }

  if (usernameExists) {
    return { success: false, message: "Username already taken." };
  }

  // Create user
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      captchaToken: data.captchaToken,
    },
  });

  if (signUpError) return { success: false, message: signUpError.message };
  if (!authData.user)
    return {
      success: false,
      message: "Bạn không thể tạo tài khoản, có lẽ đã xảy ra vấn đề. Hãy thử lại ngay!",
    };

  // Insert profile
  const { error: profileError } = await supabase
    .from("profiles")
    .insert({ id: authData.user.id, username: data.username });

  if (profileError) {
    console.error("Profile creation error:", profileError);
    // This is a critical error. The user exists in auth but not in profiles.
    // It's better to return a generic error and log it for investigation.
    return { success: false, message: "Không thể tạo hồ sơ người dùng. Vui lòng liên hệ hỗ trợ." };
  }

  return {
    success: true,
    message:
      "Thông tin đăng ký đã ghi nhận thành công rồi bạn ơi, mở hộp thư xem vé xuất hành đến CineVerse (Xác minh)",
  };
};

const sendResetPasswordEmailAction: AuthAction<ForgotPasswordFormInput> = async (
  data,
  supabase,
) => {
  const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
    captchaToken: data.captchaToken,
  });

  if (error) return { success: false, message: error.message };

  return {
    success: true,
    message: `CineVerse đã gửi thư điện tử đến ${data.email}. Kiểm tra spam nếu mail chưa có.`,
  };
};

const resetPasswordAction: AuthAction<ResetPasswordFormInput> = async (data, supabase) => {
  const { error } = await supabase.auth.updateUser({
    password: data.password,
  });

  if (error) return { success: false, message: error.message };

  return {
    success: true,
    message: "Mật khẩu mới đã phát hành. Từ nay hãy nhớ lấy mật khẩu mới này.",
  };
};

export const signIn = createAuthAction(LoginFormSchema, signInWithEmailAction);
export const signUp = createAuthAction(RegisterFormSchema, signUpAction, true);
export const sendResetPasswordEmail = createAuthAction(
  ForgotPasswordFormSchema,
  sendResetPasswordEmailAction,
);
export const resetPassword = createAuthAction(ResetPasswordFormSchema, resetPasswordAction);

export const signOut = async (): ActionResponse => {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) return { success: false, message: error.message };

  return { success: true, message: "Bạn đã đăng xuất khỏi vũ trụ" };
};
