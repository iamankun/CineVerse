"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client-new";
import { Button } from "@heroui/react";
import { Input } from "@heroui/react";
import { addToast } from "@heroui/react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);

    try {
      console.log('🔐 Login attempt:', { email, hasPassword: !!password });
      console.log('🔑 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('🔑 Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('📊 Supabase response:', { data, error });
      
      if (error) {
        console.error('❌ Login error:', error);
        
        // Check specific error types
        if (error.message?.includes('Invalid login credentials')) {
          // Check if user exists
          const { data: user } = await supabase.auth.getUser();
          console.log('👤 Current user:', user);
          
          if (!user) {
            throw new Error('Tài khoản không tồn tại. Vui lòng đăng ký trước.');
          }
          
          // Check if email is verified
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user?.email_confirmed_at === null) {
            throw new Error('Email chưa được xác minh. Vui lòng kiểm tra hộp thư.');
          }
          
          throw new Error('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
        }
        
        throw error;
      }
      
      addToast({
        title: "Đăng nhập thành công!",
        color: "success",
      });
      
      router.push("/");
    } catch (error: unknown) {
      addToast({
        title: error instanceof Error ? error.message : "Đăng nhập thất bại",
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
            Chào Mừng Trở Lại
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Đăng nhập để tiếp tục trải nghiệm CineVerse
          </p>
          
          <form onSubmit={handleLogin} className="space-y-6">
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
            
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold"
              isLoading={isLoading}
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Chưa có tài khoản?{" "}
              <button
                onClick={() => router.push("/auth/sign-up")}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Đăng ký ngay
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
