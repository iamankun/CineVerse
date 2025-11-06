import { siteConfig } from "@/config/site";
import { Metadata, NextPage } from "next/types";
import { cache } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/utils/supabase/server";
const UnauthorizedNotice = dynamic(() => import("@/components/ui/notice/Unauthorized"));
const LibraryList = dynamic(() => import("@/components/sections/Library/List"));

export const metadata: Metadata = {
  title: `Rạp phim | ${siteConfig.name}`,
};

const getUser = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return { user, error };
});

const LibraryPage: NextPage = async () => {
  const { user, error } = await getUser();

  return (
    <>
      {error || !user ? (
        <UnauthorizedNotice
          title="Bạn phải đăng nhập vào thư viện"
          description="Nếu chưa có tài khoản hãy tham gia tạo ngay một tài khoản cho bạn!"
        />
      ) : (
        <LibraryList />
      )}
    </>
  );
};

export default LibraryPage;
