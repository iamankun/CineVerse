import {
  intervalToDuration,
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
} from "date-fns";
import { Movie, MovieDetails, TV, TvShowDetails } from "tmdb-ts";

/**
 * Converts a movie duration from minutes to a human-readable format.
 *
 * @param minutes - The movie duration in minutes. If not provided, defaults to 0.
 * @returns A string representing the movie duration in the format "Xh Ym", where X is the number of hours and Y is the number of minutes.
 *
 * @example
 */
export const movieDurationString = (minutes?: number): string => {
  if (!minutes) return "N/A";
  const duration = intervalToDuration({ start: 0, end: minutes * 60 * 1000 });
  const hours = duration.hours ? `${duration.hours}h ` : "";
  const mins = duration.minutes ? `${duration.minutes}m` : "";
  return `${hours}${mins}`;
};

/**
 * Formats a duration in seconds to a human-readable format.
 *
 * @param seconds - The duration in seconds.
 * @returns A string representing the duration in the format "X:Y:Z" or "Y:Z", where X is the number of hours, Y is the number of minutes, and Z is the number of seconds.
 */
export const formatDuration = (seconds: number): string => {
  const s = Math.round(seconds);

  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  } else {
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
};

/**
 * Returns a string representing the time elapsed since the given date.
 *
 * @param date - The date to compare with the current date.
 * @returns A string representing the time elapsed since the given date.
 */
export const timeAgo = (date: Date | string): string => {
  const now = new Date();

  const seconds = differenceInSeconds(now, date);
  const minutes = differenceInMinutes(now, date);
  const hours = differenceInHours(now, date);
  const days = differenceInDays(now, date);
  const weeks = differenceInWeeks(now, date);
  const months = differenceInMonths(now, date);
  const years = differenceInYears(now, date);

  if (seconds < 20) return "Just now";
  if (seconds < 60) return `${seconds} seconds ago`;

  if (minutes === 1) return "1 minute ago";
  if (minutes < 60) return `${minutes} minutes ago`;

  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;

  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;

  if (weeks === 1) return "1 week ago";
  if (weeks < 5) return `${weeks} weeks ago`;

  if (months === 1) return "last month";
  if (months < 12) return `${months} months ago`;

  if (years === 1) return "last year";
  return `${years} years ago`;
};

/**
 * Constructs a URL for an image from the TMDB API based on the given path and type.
 * If the path is not provided, a fallback URL is returned based on the image type.
 *
 * @param path - The path to the image resource. Optional.
 * @param type - The type of the image, which can be "poster", "backdrop", "title", or "avatar". Defaults to "poster".
 * @param fullSize - A boolean indicating whether to fetch the full-size image. Defaults to false.
 * @returns A string representing the complete URL to the image.
 *
 * @example
 * getImageUrl('somepath.jpg', 'backdrop', true)
 * // returns 'https://image.tmdb.org/t/p/original/somepath.jpg'
 *
 * @example
 * getImageUrl(undefined, 'poster')
 * // returns 'https://dancyflix.com/placeholder.png'
 */
export const getImageUrl = (
  path?: string,
  type: "poster" | "backdrop" | "title" | "avatar" = "poster",
  fullSize?: boolean,
): string => {
  const size = fullSize ? "original" : "w500";
  const fallback =
    type === "poster"
      ? "https://dancyflix.com/placeholder.png"
      : type === "backdrop"
        ? "https://wallpapercave.com/wp/wp1945939.jpg"
        : "";
  return path ? `https://image.tmdb.org/t/p/${size}/${path}` : fallback;
};

/**
 * Returns the title of a movie in the given language. If the movie is in the given language, the original title is used.
 * Otherwise, the title is used. If the movie is not provided, an empty string is returned.
 *
 * @param movie The movie to get the title for. Optional.
 * @param language The language to get the title in. Defaults to "id".
 * @returns The title of the movie in the given language, or an empty string if the movie is not provided.
 */
export const mutateMovieTitle = (movie?: MovieDetails | Movie, language: string = "id"): string => {
  if (!movie) return "N/A";
  return movie.original_language === language ? movie.original_title : movie.title;
};

/**
 * Returns the title of a TV show in the given language. If the TV show is in the given language, the original name is used.
 * Otherwise, the name is used. If the TV show is not provided, an empty string is returned.
 *
 * @param tv The TV show to get the title for. Optional.
 * @param language The language to get the title in. Defaults to "id".
 * @returns The title of the TV show in the given language, or an empty string if the TV show is not provided.
 */
export const mutateTvShowTitle = (tv?: TvShowDetails | TV, language: string = "id"): string => {
  if (!tv) return "N/A";
  return tv.original_language === language ? tv.original_name : tv.name;
};

/**
 * Returns a random label for a fun loading animation.
 *
 * @returns A random label for a fun loading animation.
 */
export const getLoadingLabel = (): string => {
  const labels = [
    "Chill đi bro, Netflix còn lag mà...",
    "Chờ tí, server đi pha cà phê xíu thôi...",
    "Phim đang nghỉ hút thuốc, chờ tẹo nha...",
    "Vẫn đang load nè... đừng hỏi WiFi nhà mày...",
    "Thật ra màn hình loading này xịn hơn phim luôn...",
    "Đạo diễn đang thêm cảnh bí mật, chờ xíu...",
    "Thằng ex của mày còn quên mày nhanh hơn cái load này...",
    "Server lag như não t lúc thi...",
    "Chờ tí, đang ăn cắp WiFi hàng xóm...",
    "Loading căng não hơn cả cuộc đời t...",
    "Phim đang AFK, back xíu nha...",
    "Thanh loading đang flex vô lý á...",
    "Server đang trong mood, chờ tẹo...",
    "Phim vẫn đang tải từ năm 2010...",
    "Đạo diễn bảo 'quay thêm lần nữa', kinh điển...",
    "WiFi đang tự ti nên chậm, thông cảm...",
    "Tốc độ load này = crush của mày nhắn tin...",
    "Diễn viên vẫn đang học thoại nè...",
    "Tin vào quá trình... hoặc thôi, tùy...",
    "Server đang buffer cảm xúc chứ không phải data...",
    "Ê phim đang kẹt xe á...",
    "Chờ tí, server đang cập nhật trạng thái tình cảm...",
    "Buffering căng hơn t thức dậy sớm...",
    "Server bảo 'brb, đi vệ sinh'...",
    "Load chậm như lương về cuối tháng...",
    "Plot twist: phim sẽ buffer mãi mãi...",
    "Server đang xem hết phim rồi mới gửi cho mày...",
    "WiFi đang đóng kịch, chờ xíu...",
    "Phim đang tải từ thời dial-up, chill đi...",
    "Server vừa rage quit, nhưng vẫn load...",
    "T nghĩ server ngủ quên rồi...",
    "Buffer chậm như bà t nhắn tin...",
    "Phim vẫn đang tập dượt, tin t đi...",
    "Thanh loading đang flex không lý do...",
    "Server mất liên lạc, nhưng sẽ quay lại...",
    "Cái buffering này built khác hẳn...",
    "Lag hơn cả con PC củ chuối...",
    "Phim đang makeup, chờ tí...",
    "Server đang lướt TikTok thay vì làm việc...",
  ];

  const randomIndex = Math.floor(Math.random() * labels.length);
  return labels[randomIndex];
};
