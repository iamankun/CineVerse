"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client-new";
import { Button } from "@heroui/react";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import { User, LogOut, Settings } from "lucide-react";

export function UserProfileButton() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: any, session: any) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return null;

  if (!user) {
    return (
      <Button
        as="a"
        href="/auth/login"
        variant="flat"
        color="primary"
        startContent={<User size={20} />}
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
          startContent={<User size={20} />}
        >
          {user.email?.split("@")[0]}
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
