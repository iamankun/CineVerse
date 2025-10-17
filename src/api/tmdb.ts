import { env } from "@/utils/env";
import { isEmpty } from "@/utils/helpers";
import { TMDB } from "tmdb-ts";

const token = env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN;

if (isEmpty(token)) {
  throw new Error("TMDB chưa được cài token API");
}

// Khởi tạo TMDB client với cấu hình ngôn ngữ mặc định
// Sử dụng đúng format ngôn ngữ theo yêu cầu của thư viện
const defaultConfig = {
  language: 'vi-VN' as const  // Type assertion để phù hợp với yêu cầu của thư viện
};

// Cấu hình cho videos/trailers (giữ nguyên tiếng Anh)
const videoConfig = {
  language: 'en-US' as const
};

export const tmdb = new TMDB(token);
