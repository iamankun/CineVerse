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

    // Skip captcha check for development or if bypassed
    const hasCaptchaSiteKey = !!process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY;
    const hasValidToken = result.data.captchaToken && result.data.captchaToken !== "bypass";
    
    console.log("🔍 Captcha check:", { 
      hasSiteKey: hasCaptchaSiteKey, 
      hasToken: !!result.data.captchaToken, 
      isBypass: result.data.captchaToken === "bypass",
      hasValidToken 
    });

    // Only require captcha if site key is configured and no valid token
    if (hasCaptchaSiteKey && !hasValidToken) {
      console.log("❌ Yêu cầu Captcha");
      return { success: false, message: "Yêu cầu Captcha" };
    }

    try {
      const supabase = await createClient(admin);
      return await action(result.data, supabase);
    } catch (error) {
      // Catch potential unhandled errors in actions
      if (error instanceof Error) {
        return { success: false, message: error.message };
      }
      return { success: false, message: "Đã xảy ra lỗi không mong muốn." };
    }
  };
};

const signInWithEmailAction: AuthAction<LoginFormInput> = async (data, supabase) => {
  // Step 1: Authenticate with Supabase Auth
  const { data: user, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.loginPassword,
    options: {
      captchaToken: data.captchaToken,
    },
  });

  if (error) return { success: false, message: error.message };
  
  console.log("✅ Auth successful:", { userId: user.user.id, email: user.user.email });

  // Step 2: Check if profile exists (using service role to bypass RLS)
  const { data: username, error: usernameError } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.user.id)
    .maybeSingle();

  if (usernameError) {
    console.error("❌ Profile lookup error:", usernameError);
    // Try to create profile if it doesn't exist
    const { error: createError } = await supabase
      .from("profiles")
      .insert({ id: user.user.id, username: user.user.email?.split('@')[0] || 'user' });
    
    if (createError) {
      console.error("❌ Profile creation failed:", createError);
      return {
        success: false,
        message: `Lỗi truy cập hồ sơ: ${createError.message}`,
      };
    }
    
    return { success: true, message: `Chào mừng trở lại, ${user.user.email}!` };
  }

  if (!username) {
    console.error("❌ Profile not found for user:", user.user.id);
    // Auto-create profile
    const { error: createError } = await supabase
      .from("profiles")
      .insert({ id: user.user.id, username: user.user.email?.split('@')[0] || 'user' });
    
    if (createError) {
      console.error("❌ Auto-profile creation failed:", createError);
      return {
        success: false,
        message: `Không thể tạo hồ sơ: ${createError.message}`,
      };
    }
    
    return { success: true, message: `Chào mừng trở lại, ${user.user.email}!` };
  }

  console.log("✅ Profile found:", username);
  return { success: true, message: `Chào mừng trở lại, ${username.username}` };
};

const signUpAction: AuthAction<RegisterFormInput> = async (data, supabase) => {
  console.log("🔄 Starting registration for:", data.email);
  
  // Step 1: Check username availability
  const { data: usernameExists, error: usernameError } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", data.username)
    .maybeSingle();

  if (usernameError) {
    console.error("❌ Username check error:", usernameError);
    return { success: false, message: "CineVerse báo lỗi. Tài khoản không khớp." };
  }

  if (usernameExists) {
    console.log("❌ Username already exists:", data.username);
    return { success: false, message: "Tên người dùng đã được sử dụng." };
  }

  // Step 2: Create auth user in auth.users
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      captchaToken: data.captchaToken,
    },
  });

  if (signUpError) {
    console.error("❌ Auth signup error:", signUpError);
    return { success: false, message: signUpError.message };
  }
  
  if (!authData.user) {
    console.error("❌ No user data returned");
    return {
      success: false,
      message: "Bạn không thể tạo tài khoản, có lẽ đã xảy ra vấn đề. Hãy thử lại ngay!",
    };
  }

  console.log("✅ Auth user created:", { userId: authData.user.id, email: authData.user.email });

  // Step 3: Create profile in public.profiles
  const { error: profileError } = await supabase
    .from("profiles")
    .insert({ id: authData.user.id, username: data.username });

  if (profileError) {
    console.error("❌ Profile creation error:", profileError);
    // This is a critical error. The user exists in auth but not in profiles.
    return { success: false, message: `Không thể tạo hồ sơ người dùng: ${profileError.message}` };
  }

  console.log("✅ Profile created successfully");
  return {
    success: true,
    message: "Thông tin đăng ký đã ghi nhận thành công rồi bạn ơi, mở hộp thư xem vé xuất hành đến CineVerse (Xác minh)",
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
  console.log("🔄 Starting sign out process");
  
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("❌ Sign out error:", error);
    return { success: false, message: error.message };
  }

  console.log("✅ Sign out successful");
  return { success: true, message: "Bạn đã đăng xuất khỏi vũ trụ" };
};
