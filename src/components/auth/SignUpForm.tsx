"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@heroui/react";
import { Input } from "@heroui/react";
import { addToast } from "@heroui/react";

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      addToast({
        title: "Mật khẩu không khớp",
        color: "danger",
      });
      return;
    }
    
    const supabase = createClient();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: email.split('@')[0],
            username: email.split('@')[0],
          }
        }
      });
      
      console.log('🔍 [SIGNUP] Supabase response:', { data, error });
      
      if (error) {
        console.error('❌ [SIGNUP] Error:', error);
        throw error;
      }
      
      addToast({
        title: "Đăng ký thành công! Vui lòng kiểm tra email để xác minh.",
        color: "success",
      });
      
      // Kiểm tra xem có cần xác minh email không
      if (data?.user?.email_confirmed_at) {
        console.log('✅ [SIGNUP] Email đã xác minh, chuyển đến login');
        router.push("/auth/login");
      } else {
        console.log('⏳ [SIGNUP] Email cần xác minh, chuyển đến login');
        router.push("/auth/login?message=please_verify_email");
      }
    } catch (error: unknown) {
      addToast({
        title: error instanceof Error ? error.message : "Đăng ký thất bại",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="w-full max-w-md p-8">
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700">
          <h1 className="text-3xl font-bold text-white mb-2 text-center">
            Tham Gia CineVerse
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Tạo tài khoản để bắt đầu hành trình điện ảnh
          </p>
          
          <form onSubmit={handleSignUp} className="space-y-6">
            <div>
              <Input
                type="email"
                label="Email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="bordered"
                classNames={{
                  label: "text-gray-300",
                  input: "text-white",
                  inputWrapper: "border-gray-600 hover:border-gray-500",
                }}
                required
              />
            </div>
            
            <div>
              <Input
                type="password"
                label="Mật khẩu"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="bordered"
                classNames={{
                  label: "text-gray-300",
                  input: "text-white",
                  inputWrapper: "border-gray-600 hover:border-gray-500",
                }}
                required
              />
            </div>
            
            <div>
              <Input
                type="password"
                label="Xác nhận mật khẩu"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                variant="bordered"
                classNames={{
                  label: "text-gray-300",
                  input: "text-white",
                  inputWrapper: "border-gray-600 hover:border-gray-500",
                }}
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold"
              isLoading={isLoading}
            >
              {isLoading ? "Đang đăng ký..." : "Đăng ký"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Đã có tài khoản?{" "}
              <button
                onClick={() => router.push("/auth/login")}
                className="text-purple-400 hover:text-purple-300 underline"
              >
                Đăng nhập ngay
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
