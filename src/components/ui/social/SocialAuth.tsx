"use client";

import { Chrome } from "lucide-react";
import { Button } from "@heroui/react";
import { createClient } from "@/utils/supabase/client";
import { addToast } from "@heroui/react";
import { useCallback } from "react";

const supabase = createClient();

const GoogleAuthButton: React.FC = () => {
  const handleGoogleLogin = useCallback(async () => {
    try {
      console.log("🔄 Bắt đầu đăng nhập Google");
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `https://cineverse.ankun.dev/api/auth/callback`,
          skipBrowserRedirect: false,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      
      console.log("🔄 Kết quả Google OAuth:", { data, error });
      
      if (error) {
        console.error("❌ Lỗi Google OAuth:", error);
        addToast({
          title: `Lỗi đăng nhập Google: ${error.message}`,
          color: "danger",
        });
        return;
      }
      
      console.log("✅ Google OAuth redirect initiated");
      
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
      startContent={<Chrome size={20} />}
      onPress={handleGoogleLogin}
      variant="faded"
      className="w-full"
    >
      Đăng nhập với Google
    </Button>
  );
};

const SocialAuth: React.FC = () => {
  return (
    <div className="space-y-3">
      <GoogleAuthButton />
    </div>
  );
};

export default SocialAuth;
