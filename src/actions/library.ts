"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Types
type ContentType = "movie" | "tv";
type FilterType = ContentType | "all";

interface WatchlistItem {
  id: number;
  type: ContentType;
  adult: boolean;
  backdrop_path: string;
  poster_path?: string | null;
  release_date: string;
  title: string;
  vote_average: number;
}

interface WatchlistEntry extends WatchlistItem {
  user_id: string;
  created_at: string;
}

interface ActionResponse<T = any> {
  success: boolean;
  error?: string;
  message?: string;
  data?: T;
}

interface WatchlistResponse extends ActionResponse<WatchlistEntry[]> {
  totalCount?: number;
  totalPages?: number;
  currentPage?: number;
  hasNextPage?: boolean;
}

interface CheckWatchlistResponse extends ActionResponse {
  isInWatchlist: boolean;
}

/**
 * Add item to watchlist
 */
export async function addToWatchlist(item: WatchlistItem): Promise<ActionResponse<WatchlistEntry>> {
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
        error: "Bạn phải đăng nhập để thêm mục vào danh sách theo dõi",
      };
    }

    // Validate required fields
    if (!item.id || !item.type || !item.title) {
      return {
        success: false,
        error: "Thiếu trường bắt buộc",
      };
    }

    // Validate type
    if (!["movie", "tv"].includes(item.type)) {
      return {
        success: false,
        error: 'Loại nội dung không hợp lệ. Phải là "Điện Ảnh" hoặc "Chương Trình TV"',
      };
    }

    // Add to watchlist
    const supabaseClient = supabase as any;
    const { data, error } = await supabaseClient
      .from("watchlist")
      .insert([{
        user_id: user.id,
        id: item.id,
        type: item.type,
        adult: item.adult || false,
        backdrop_path: item.backdrop_path || "",
        poster_path: item.poster_path || null,
        release_date: item.release_date || new Date().toISOString().split("T")[0],
        title: item.title,
        vote_average: item.vote_average || 0,
      }])
      .select()
      .single();

    if (error) {
      // Check if it's a duplicate error
      if (error.code === "23505") {
        return {
          success: false,
          error: "Mục này đã có trong danh sách theo dõi của bạn",
        };
      }

      console.error("Lỗi thêm vào danh sách theo dõi:", error);
      return {
        success: false,
        error: "Không thể thêm mục vào danh sách theo dõi",
      };
    }

    // Revalidate the watchlist page if you have one
    revalidatePath("/library");

    return {
      success: true,
      data,
      message: "Đã thêm vào danh sách theo dõi thành công",
    };
  } catch (error) {
    console.error("Lỗi không mong muốn:", error);
    return {
      success: false,
      error: "Đã xảy ra lỗi không mong muốn",
    };
  }
}

/**
 * Remove item from watchlist
 */
export async function removeFromWatchlist(id: number, type: ContentType): Promise<ActionResponse> {
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
        error: "Bạn phải đăng nhập để xóa mục khỏi danh sách theo dõi",
      };
    }

    // Validate inputs
    if (!id || !type) {
      return {
        success: false,
        error: "Thiếu tham số bắt buộc",
      };
    }

    // Validate type
    if (!["movie", "tv"].includes(type)) {
      return {
        success: false,
        error: 'Loại nội dung không hợp lệ. Phải là "Điện Ảnh" hoặc "Chương Trình TV"',
      };
    }

    // Delete from watchlist
    const { error } = await (supabase as any)
      .from("watchlist")
      .delete()
      .eq("user_id", user.id)
      .eq("id", id)
      .eq("type", type);

    if (error) {
      console.error("Lỗi xóa khỏi danh sách theo dõi:", error);
      return {
        success: false,
        error: "Không thể xóa mục khỏi danh sách theo dõi",
      };
    }

    // Revalidate the watchlist page
    revalidatePath("/library");

    return {
      success: true,
      message: "Đã xóa khỏi danh sách theo dõi thành công",
    };
  } catch (error) {
    console.error("Lỗi không mong muốn:", error);
    return {
      success: false,
      error: "Đã xảy ra lỗi không mong muốn",
    };
  }
}

/**
 * Remove all items from watchlist
 */
export const removeAllWatchlist = async (type: ContentType): Promise<ActionResponse> => {
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
        error: "Bạn phải đăng nhập để xóa mục khỏi danh sách theo dõi",
      };
    }

    // Validate type
    if (!["movie", "tv"].includes(type)) {
      return {
        success: false,
        error: 'Loại nội dung không hợp lệ. Phải là "Điện Ảnh" hoặc "Chương Trình TV"',
      };
    }

    // Delete from watchlist
    const { error } = await (supabase as any)
      .from("watchlist")
      .delete()
      .eq("user_id", user.id)
      .eq("type", type);

    if (error) {
      console.error("Lỗi xóa khỏi danh sách theo dõi:", error);
      return {
        success: false,
        error: "Không thể xóa mục khỏi danh sách theo dõi",
      };
    }

    // Revalidate the watchlist page
    revalidatePath("/library");

    return {
      success: true,
      message: "Đã xóa khỏi danh sách theo dõi thành công",
    };
  } catch (error) {
    console.error("Lỗi không mong muốn:", error);
    return {
      success: false,
      error: "Đã xảy ra lỗi không mong muốn",
    };
  }
};

/**
 * Check if item is in watchlist
 */
export async function checkInWatchlist(
  id: number,
  type: ContentType,
): Promise<CheckWatchlistResponse> {
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
        isInWatchlist: false,
        error: "Người dùng chưa xác thực",
      };
    }

    // Check if exists
    const { data, error } = await (supabase as any)
      .from("watchlist")
      .select("id")
      .eq("user_id", user.id)
      .eq("id", id)
      .eq("type", type)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Lỗi kiểm tra danh sách theo dõi:", error);
      return {
        success: false,
        isInWatchlist: false,
        error: "Không thể kiểm tra trạng thái danh sách theo dõi",
      };
    }

    return {
      success: true,
      isInWatchlist: !!data,
    };
  } catch (error) {
    console.error("Lỗi không mong muốn:", error);
    return {
      success: false,
      isInWatchlist: false,
      error: "Đã xảy ra lỗi không mong muốn",
    };
  }
}

/**
 * Get user's watchlist with pagination - optimized for infinite scroll
 */
export async function getWatchlist(
  filterType: FilterType = "all",
  page: number = 1,
  limit: number = 20,
): Promise<WatchlistResponse> {
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
        data: [],
        error: "Người dùng chưa xác thực",
      };
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build query
    let query = (supabase as any)
      .from("watchlist")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply type filter if not 'all'
    if (filterType !== "all" && ["movie", "tv"].includes(filterType)) {
      query = query.eq("type", filterType);
    }

    const { data, count, error } = await query;

    if (error) {
      console.error("Lỗi lấy danh sách theo dõi:", error);
      return {
        success: false,
        data: [],
        error: "Không thể lấy danh sách theo dõi",
      };
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      success: true,
      data: (data as WatchlistEntry[]) || [],
      totalCount: count || 0,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
    };
  } catch (error) {
    console.error("Lỗi không mong muốn:", error);
    return {
      success: false,
      data: [],
      error: "Đã xảy ra lỗi không mong muốn",
    };
  }
}

/**
 * Toggle watchlist status (helper function)
 */
export async function toggleWatchlist(item: WatchlistItem): Promise<ActionResponse> {
  const checkResult = await checkInWatchlist(item.id, item.type);

  if (!checkResult.success) {
    return checkResult;
  }

  if (checkResult.isInWatchlist) {
    return await removeFromWatchlist(item.id, item.type);
  } else {
    return await addToWatchlist(item);
  }
}
