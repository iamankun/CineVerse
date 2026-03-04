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

    // Check if user already disliked this comment
    const { data: existingDislike } = await supabase
      .from('comment_reactions')
      .select('*')
      .eq('comment_id', id)
      .eq('user_id', user.id)
      .eq('reaction_type', 'dislike')
      .single();

    // Check if user liked this comment (to remove it)
    const { data: existingLike } = await supabase
      .from('comment_reactions')
      .select('*')
      .eq('comment_id', id)
      .eq('user_id', user.id)
      .eq('reaction_type', 'like')
      .single();

    if (existingDislike) {
      // User already disliked - remove the dislike (undislike)
      const { error: deleteError } = await supabase
        .from('comment_reactions')
        .delete()
        .eq('comment_id', id)
        .eq('user_id', user.id)
        .eq('reaction_type', 'dislike');

      if (deleteError) {
        console.error('Error removing dislike:', deleteError);
        return NextResponse.json<{ success: boolean; error?: string }>({
          success: false,
          error: 'Failed to remove dislike'
        }, { status: 500 });
      }

      // Decrement dislikes count
      const { error: decrementError } = await supabase.rpc('decrement_comment_dislikes', { 
        comment_id: id 
      });

      if (decrementError) {
        console.error('Error decrementing dislikes:', decrementError);
      }

      return NextResponse.json({
        success: true,
        action: 'undisliked'
      });
    }

    // Remove like if exists (switching from like to dislike)
    if (existingLike) {
      const { error: deleteLikeError } = await supabase
        .from('comment_reactions')
        .delete()
        .eq('comment_id', id)
        .eq('user_id', user.id)
        .eq('reaction_type', 'like');

      if (deleteLikeError) {
        console.error('Error removing like:', deleteLikeError);
      } else {
        // Decrement likes count
        await supabase.rpc('decrement_comment_likes', { 
          comment_id: id 
        });
      }
    }

    // Add the dislike
    const { error: insertError } = await supabase
      .from('comment_reactions')
      .insert({
        comment_id: id,
        user_id: user.id,
        reaction_type: 'dislike'
      });

    if (insertError) {
      console.error('Error adding dislike:', insertError);
      return NextResponse.json<{ success: boolean; error?: string }>({
        success: false,
        error: 'Failed to dislike comment'
      }, { status: 500 });
    }

    // Increment dislikes count
    const { error: incrementError } = await supabase.rpc('increment_comment_dislikes', { 
      comment_id: id 
    });

    if (incrementError) {
      console.error('Error incrementing dislikes:', incrementError);
    }

    return NextResponse.json({
      success: true,
      action: existingLike ? 'switched_to_dislike' : 'disliked'
    });
  } catch (error) {
    console.error('Error in dislike comment:', error);
    return NextResponse.json<{ success: boolean; error?: string }>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
