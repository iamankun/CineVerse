import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    console.log("🔥 [AVATAR-UPLOAD] Upload request:", {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      userId: userId?.substring(0, 8) + "..."
    });

    if (!file || !userId) {
      console.log("❌ [AVATAR-UPLOAD] Missing file or userId");
      return NextResponse.json(
        { error: "File and userId are required" },
        { status: 400 }
      );
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log("❌ [AVATAR-UPLOAD] File too large:", file.size);
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      console.log("❌ [AVATAR-UPLOAD] Invalid file type:", file.type);
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Check if bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
      console.error("❌ [AVATAR-UPLOAD] Failed to list buckets:", bucketError);
      return NextResponse.json(
        { error: "Storage error: " + bucketError.message },
        { status: 500 }
      );
    }

    const avatarsBucket = buckets.find(b => b.name === 'avatars');
    if (!avatarsBucket) {
      console.log("🔥 [AVATAR-UPLOAD] Creating avatars bucket...");
      const { error: createError } = await supabase.storage.createBucket('avatars', {
        public: true,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (createError) {
        console.error("❌ [AVATAR-UPLOAD] Failed to create bucket:", createError);
        return NextResponse.json(
          { error: "Failed to create storage bucket: " + createError.message },
          { status: 500 }
        );
      }
      
      console.log("✅ [AVATAR-UPLOAD] Created avatars bucket");
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    console.log("🔥 [AVATAR-UPLOAD] Uploading file:", {
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
      console.error("❌ [AVATAR-UPLOAD] Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image: " + uploadError.message },
        { status: 500 }
      );
    }

    console.log("✅ [AVATAR-UPLOAD] Upload successful");

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    console.log("🔥 [AVATAR-UPLOAD] Public URL:", publicUrl);

    // Update profile with avatar URL
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ 
        avatar_url: publicUrl
      })
      .eq("id", userId);

    if (updateError) {
      console.error("❌ [AVATAR-UPLOAD] Profile update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update profile: " + updateError.message },
        { status: 500 }
      );
    }

    console.log("✅ [AVATAR-UPLOAD] Profile updated successfully");

    return NextResponse.json({
      message: "Avatar uploaded successfully",
      avatarUrl: publicUrl,
    });

  } catch (error: any) {
    console.error("❌ [AVATAR-UPLOAD] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
