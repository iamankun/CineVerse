"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@heroui/react";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import { User, LogOut, Settings, Crown, Star, Check } from "lucide-react";
import { Avatar } from "@heroui/react";

export function UserProfileButton() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  console.log('🔍 UserProfileButton: Component rendered, loading:', loading, 'user:', !!user);

  useEffect(() => {
    const supabase = createClient();
    
    // Simple approach - just get user auth state first
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        setLoading(false);
        
        // After getting user, fetch profile data separately
        if (user) {
          fetchProfileData(user.id);
        }
      } catch (error) {
        console.error('UserProfileButton error:', error);
        setLoading(false);
      }
    };

    const fetchProfileData = async (userId: string) => {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        
        if (profile) {
          setProfile(profile);
        }
      } catch (error) {
        console.log('Profile not found or error:', error);
        // Don't set error state, just continue without profile
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (session?.user) {
          fetchProfileData(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  // Render Facebook-style verified badge
  const renderVerifiedBadge = () => {
    if (!profile || profile.verify !== 'true') return null;
    
    if (profile.role === 'admin') {
      return (
        <span title="Quản trị viên" className="ml-1">
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none"
            className="inline-block"
          >
            <circle cx="12" cy="12" r="11" fill="#FFD700"/>
            <path 
              d="M8 12L11 15L16 9" 
              stroke="white" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </span>
      );
    }
    
    if (profile.role === 'member') {
      return (
        <span title="Nghiện phim ưu tú" className="ml-1">
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none"
            className="inline-block"
          >
            <circle cx="12" cy="12" r="11" fill="#1877F2"/>
            <path 
              d="M8 12L11 15L16 9" 
              stroke="white" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </span>
      );
    }
    
    return null;
  };

  // Get display name - prioritize profile data
  const getDisplayName = () => {
    if (profile?.full_name) return profile.full_name;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return user.email.split("@")[0];
    return "User";
  };

  if (loading) {
    return (
      <Button
        variant="flat"
        color="primary"
        startContent={<User size={20} />}
        className="h-10 px-4 min-w-fit"
        style={{ zIndex: 9999 }}
      >
        Đang tải...
      </Button>
    );
  }

  if (!user) {
    return (
      <Button
        as="a"
        href="/auth/login"
        variant="flat"
        color="primary"
        startContent={<User size={20} />}
        className="h-10 px-4 min-w-fit"
        style={{ zIndex: 9999 }}
      >
        Đăng nhập
      </Button>
    );
  }

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button
          variant="flat"
          color="primary"
          startContent={
            <Avatar
              src={profile?.avatar_url}
              size="sm"
              fallback={<User size={16} />}
              className="h-6 w-6"
            />
          }
          className="h-10 px-4 min-w-fit"
          style={{ zIndex: 9999 }}
        >
          <span className="flex items-center">
            {getDisplayName()}
            {renderVerifiedBadge()}
          </span>
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="User menu">
        <DropdownItem
          key="profile"
          startContent={<Settings size={16} />}
          onClick={() => router.push("/profile")}
        >
          Chỉnh sửa profile
        </DropdownItem>
        
        {profile?.role === 'admin' ? (
          <DropdownItem
            key="admin"
            startContent={<Settings size={16} />}
            onClick={() => router.push("/admin")}
          >
            Quản trị viên
          </DropdownItem>
        ) : (
          <DropdownItem
            key="admin-denied"
            startContent={<Settings size={16} />}
            isDisabled
            className="opacity-50"
          >
            Quản trị viên (Không có quyền)
          </DropdownItem>
        )}
        
        <DropdownItem
          key="logout"
          startContent={<LogOut size={16} />}
          onClick={handleLogout}
          color="danger"
        >
          Đăng xuất
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
