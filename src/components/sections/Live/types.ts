export type StreamType = "hls" | "rtmp" | "dash" | "direct" | "youtube";

export interface TVChannel {
  id: string;
  name: string;
  logo?: string;
  url: string;
  type: StreamType;
  category: ChannelCategory;
  country?: string;
  quality?: "SD" | "HD" | "FHD" | "4K";
  isWorking?: boolean;
}

export type ChannelCategory = 
  | "entertainment"
  | "news"
  | "sports"
  | "movies"
  | "music"
  | "kids"
  | "documentary"
  | "lifestyle"
  | "education"
  | "religion"
  | "other";

export const categoryLabels: Record<ChannelCategory, string> = {
  entertainment: "Giải trí",
  news: "Tin tức",
  sports: "Thể thao",
  movies: "Phim",
  music: "Âm nhạc",
  kids: "Thiếu nhi",
  documentary: "Tài liệu",
  lifestyle: "Đời sống",
  education: "Giáo dục",
  religion: "Tôn giáo",
  other: "Khác",
};

export const categoryColors: Record<ChannelCategory, "primary" | "secondary" | "success" | "warning" | "danger" | "default"> = {
  entertainment: "primary",
  news: "danger",
  sports: "success",
  movies: "secondary",
  music: "warning",
  kids: "primary",
  documentary: "default",
  lifestyle: "success",
  education: "warning",
  religion: "default",
  other: "default",
};
