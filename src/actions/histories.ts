"use server";

import { tmdb } from "@/api/tmdb";
import { VidlinkEventData } from "@/hooks/useVidlinkPlayer";
import { ActionResponse } from "@/types";
import { HistoryDetail } from "@/types/movie";
import { mutateMovieTitle, mutateTvShowTitle } from "@/utils/movies";
import { createClient } from "@/utils/supabase/server";

export const syncHistory = async (
  data: VidlinkEventData["data"],
  completed?: boolean,
): ActionResponse => {
  console.info("Lưu lịch sử:", data);

  if (!data) return { success: false, message: "Không có dữ liệu để lưu" };

  if (data.mediaType === "tv" && (!data.season || !data.episode)) {
    return { success: false, message: "Thiếu mùa hoặc tập" };
  }

  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        message: "Bạn phải đăng nhập để lưu lịch sử",
      };
    }

    // Validate required fields
    if (!data.mtmdbId || !data.mediaType) {
      return {
        success: false,
        message: "Thiếu trường bắt buộc trong dữ liệu lịch sử",
      };
    }

    // Validate type
    if (!["movie", "tv"].includes(data.mediaType)) {
      return {
        success: false,
        message: 'Loại nội dung không hợp lệ. Phải là "Điện Ảnh" hoặc "Chương Trình TV"',
      };
    }

    const media =
      data.mediaType === "movie"
        ? await tmdb.movies.details(data.mtmdbId, [], 'vi-VN')
        : await tmdb.tvShows.details(data.mtmdbId, [], 'vi-VN');

    // Insert or update history
    const { data: history, error } = await (supabase as any)
      .from("histories")
      .upsert([
        {
          user_id: user.id,
          media_id: data.mtmdbId,
          type: data.mediaType,
          episode: data.episode || 0,
          duration: data.duration,
          last_position: data.currentTime,
          completed: completed || false,
          adult: "adult" in media ? media.adult : false,
          backdrop_path: media.backdrop_path || "",
          poster_path: media.poster_path || "",
          release_date: "release_date" in media ? media.release_date : media.first_air_date || "",
          title: "title" in media ? mutateMovieTitle(media) : mutateTvShowTitle(media),
          vote_average: media.vote_average || 0,
        }
      ])
      .select()
      .single();

    if (error) {
      console.info("Lỗi lưu lịch sử:", error);
      return {
        success: false,
        message: "Không thể lưu lịch sử",
      };
    }

    console.info("Lịch sử đã lưu:", history);
    return {
      success: true,
      message: "Lịch sử đã được lưu thành công",
    };
  } catch (error) {
    console.info("Lỗi không mong muốn:", error);
    return {
      success: false,
      message: "Đã xảy ra lỗi không mong muốn",
    };
  }
};

export const getUserHistories = async (limit: number = 20): ActionResponse<HistoryDetail[]> => {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        message: "Người dùng chưa xác thực",
      };
    }

    const { data, error } = await (supabase as any)
      .from("histories")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.info("Lỗi lấy lịch sử:", error);
      return {
        success: false,
        message: "Không thể lấy lịch sử",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.info("Lỗi không mong muốn:", error);
    return {
      success: false,
      message: "Đã xảy ra lỗi không mong muốn",
    };
  }
};

export const getMovieLastPosition = async (id: number): Promise<number> => {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return 0;
    }

    const { data, error } = await (supabase as any)
      .from("histories")
      .select("last_position")
      .eq("user_id", user.id)
      .eq("media_id", id)
      .eq("type", "movie");

    if (error) {
      console.info("Lỗi lấy vị trí cuối cùng của phim:", error);
      return 0;
    }

    return data?.[0]?.last_position || 0;
  } catch (error) {
    console.info("Lỗi không mong muốn:", error);
    return 0;
  }
};

export const getTvShowLastPosition = async (
  id: number,
  season: number,
  episode: number,
): Promise<number> => {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return 0;
    }

    const { data, error } = await (supabase as any)
      .from("histories")
      .select("last_position")
      .eq("user_id", user.id)
      .eq("media_id", id)
      .eq("type", "tv")
      .eq("season", season)
      .eq("episode", episode);

    if (error) {
      console.info("Lỗi lấy vị trí cuối cùng của chương trình TV:", error);
      return 0;
    }

    return data?.[0]?.last_position || 0;
  } catch (error) {
    console.info("Lỗi không mong muốn:", error);
    return 0;
  }
};
