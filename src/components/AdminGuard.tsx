"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@heroui/react";
import { createClient } from "@/utils/supabase/client";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          // User not logged in, redirect to main login
          router.push("/auth/login?redirectTo=/admin");
          return;
        }

        // Check if user has admin role
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        
        if (profileError) {
          console.log('Profile error:', profileError.message);
          // If no profile, create one with admin role
          if (profileError.message?.includes('No rows returned')) {
            const { error: createError } = await supabase
              .from("profiles")
              .insert({
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || 'Admin',
                username: user.user_metadata?.username || 'admin',
                role: 'admin',
                verify: 'true'
              } as any);
            
            if (createError) {
              console.log('Error creating profile:', createError.message);
              router.push("/");
              return;
            }
          } else {
            router.push("/");
            return;
          }
        }
        
        const profileData = profile as any;
        
        if (profileData?.role === 'admin') {
          setIsAuthenticated(true);
        } else {
          // User is logged in but not admin
          router.push("/");
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push("/");
      }
    };

    checkAuth();
  }, [router]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-white mt-4">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
