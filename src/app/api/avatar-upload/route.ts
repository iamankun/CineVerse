import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    console.log("🔥 [ẢNH ĐẠI DIỆN] Yêu cầu tải lên:", {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      userId: userId?.substring(0, 8) + "..."
    });

    if (!file || !userId) {
      console.log("❌ [ẢNH ĐẠI DIỆN] Thiếu tệp hoặc ID người dùng");
      return NextResponse.json(
        { error: "Cần có tệp và ID người dùng." },
        { status: 400 }
      );
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log("❌ [ẢNH ĐẠI DIỆN] Tệp lớn hơn 5MB:", file.size);
      return NextResponse.json(
        { error: "Tệp phải bằng hoặc dưới 5MB" },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      console.log("❌ [ẢNH ĐẠI DIỆN] Loại tệp không hợp lệ:", file.type);
      return NextResponse.json(
        { error: "Tệp của bạn phải là hình ảnh, bạn đừng trêu CineVerse" },
        { status: 400 }
      );
    }

    // Check if bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
      console.error("❌ [ẢNH ĐẠI DIỆN] Không thể liệt kê thư mục:", bucketError);
      return NextResponse.json(
        { error: "Lỗi lưu trữ: " + bucketError.message },
        { status: 500 }
      );
    }

    const avatarsBucket = buckets.find(b => b.name === 'avatars');
    if (!avatarsBucket) {
      console.log("🔥 [ẢNH ĐẠI DIỆN] Đang tạo thư mục ảnh đại diện của bạn...");
      const { error: createError } = await supabase.storage.createBucket('avatars', {
        public: true,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (createError) {
        console.error("❌ [ẢNH ĐẠI DIỆN] Lỗi khi tạo ra thư mục ảnh đại diện:", createError);
        return NextResponse.json(
          { error: "Lỗi khi tạo ra thư mục ảnh đại diện của bạn:" + createError.message },
          { status: 500 }
        );
      }
      
      console.log("✅ [ẢNH ĐẠI DIỆN] Đã tạo thư mục ảnh đại diện của bạn");
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    console.log("🔥 [ẢNH ĐẠI DIỆN] Đang tải ảnh lên:", {
      filePath,
      fileName,
      fileExt
    });

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("❌ [ẢNH ĐẠI DIỆN] Lỗi tải lên:", uploadError);
      return NextResponse.json(
        { error: "Thất bại khi tải ảnh lên: " + uploadError.message },
        { status: 500 }
      );
    }

    console.log("✅ [ẢNH ĐẠI DIỆN] Tải lên thành công");

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    console.log("🔥 [ẢNH ĐẠI DIỆN] Liên kết công khai:", publicUrl);

    // Update profile with avatar URL
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ 
        avatar_url: publicUrl
      })
      .eq("id", userId);

    if (updateError) {
      console.error("❌ [ẢNH ĐẠI DIỆN] Lỗi tải lên trang cá nhân:", updateError);
      return NextResponse.json(
        { error: "Lỗi khi cập nhật trang cá nhân: " + updateError.message },
        { status: 500 }
      );
    }

    console.log("✅ [ẢNH ĐẠI DIỆN] Trang cá nhân đã cập nhật ảnh đại diện");

    return NextResponse.json({
      message: "Ảnh đại diện tải lên thành công",
      avatarUrl: publicUrl,
    });

  } catch (error: any) {
    console.error("❌ [ẢNH ĐẠI DIỆN] Lỗi không mong đợi:", error);
    return NextResponse.json(
      { error: "Lỗi máy chủ nội bộ: " + error.message },
      { status: 500 }
    );
  }
}
