import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Check if avatars bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      return NextResponse.json({ 
        error: "Failed to list buckets", 
        details: bucketsError 
      }, { status: 500 });
    }
    
    const avatarsBucket = buckets.find(b => b.name === 'avatars');
    
    if (!avatarsBucket) {
      // Create avatars bucket
      const { error: createError } = await supabase.storage.createBucket('avatars', {
        public: true,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (createError) {
        return NextResponse.json({ 
          error: "Failed to create bucket", 
          details: createError 
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        message: "Created avatars bucket",
        buckets: buckets 
      });
    }
    
    return NextResponse.json({ 
      message: "Avatars bucket exists",
      buckets: buckets,
      avatarsBucket: avatarsBucket
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error 
    }, { status: 500 });
  }
}
