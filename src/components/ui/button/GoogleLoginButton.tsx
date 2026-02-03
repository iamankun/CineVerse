"use client";

import { Google } from "@/utils/icons";
import { createClient } from "@/utils/supabase/client";
import { addToast, Button } from "@heroui/react";
import { useCallback } from "react";

type GoogleLoginButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "children" | "startContent" | "onPress"
>;

const supabase = createClient();

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ variant = "faded", ...props }) => {
  const handleGoogleLogin = useCallback(async () => {
    try {
      console.log("🔄 Bắt đầu đăng nhập Google");
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
          skipBrowserRedirect: false,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      
      console.log("🔄 Kết quả OAuth:", { data, error });
      
      if (error) {
        console.error("❌ Lỗi OAuth:", error);
        addToast({
          title: `Lỗi đăng nhập Google: ${error.message}`,
          color: "danger",
        });
        return;
      }
      
      // OAuth redirect should happen automatically
      console.log("✅ OAuth redirect initiated");
      
      // Check if popup was blocked
      setTimeout(() => {
        if (!data?.url) {
          console.warn("⚠️ No OAuth URL returned - popup might be blocked");
          addToast({
            title: "Popup bị chặn. Vui lòng cho phép popup và thử lại.",
            color: "warning",
          });
        }
      }, 1000);
      
    } catch (error) {
      console.error("❌ Lỗi đăng nhập Google:", error);
      addToast({
        title: error instanceof Error ? error.message : "Đã xảy ra lỗi. Vui lòng thử lại.",
        color: "danger",
      });
    }
  }, []);

  return (
    <Button
      startContent={<Google width={24} />}
      onPress={handleGoogleLogin}
      variant={variant}
      {...props}
    >
      Đăng nhập với Google
    </Button>
  );
};

export default GoogleLoginButton;
