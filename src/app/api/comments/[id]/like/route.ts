import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (!user || authError) {
      return NextResponse.json<{ success: boolean; error?: string }>({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    // Check if user already liked this comment
    const { data: existingLike } = await supabase
      .from('comment_reactions')
      .select('*')
      .eq('comment_id', id)
      .eq('user_id', user.id)
      .eq('type', 'like')
      .single();

    if (existingLike) {
      // Remove like (unlike)
      await supabase
        .from('comment_reactions')
        .delete()
        .eq('comment_id', id)
        .eq('user_id', user.id)
        .eq('type', 'like');

      // Update comment likes count
      await supabase.rpc('decrement_comment_likes', { comment_id: id });

      return NextResponse.json({
        success: true,
        liked: false
      });
    } else {
      // Add like
      await supabase
        .from('comment_reactions')
        .insert({
          comment_id: id,
          user_id: user.id,
          type: 'like'
        });

      // Update comment likes count
      await supabase.rpc('increment_comment_likes', { comment_id: id });

      return NextResponse.json({
        success: true,
        liked: true
      });
    }

  } catch (error) {
    console.error('Error in like comment:', error);
    return NextResponse.json<{ success: boolean; error?: string }>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
