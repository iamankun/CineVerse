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
      .eq('reaction_type', 'like')
      .single();

    // Check if user disliked this comment (to remove it)
    const { data: existingDislike } = await supabase
      .from('comment_reactions')
      .select('*')
      .eq('comment_id', id)
      .eq('user_id', user.id)
      .eq('reaction_type', 'dislike')
      .single();

    if (existingLike) {
      // User already liked - remove the like (unlike)
      const { error: deleteError } = await supabase
        .from('comment_reactions')
        .delete()
        .eq('comment_id', id)
        .eq('user_id', user.id)
        .eq('reaction_type', 'like');

      if (deleteError) {
        console.error('Error removing like:', deleteError);
        return NextResponse.json<{ success: boolean; error?: string }>({
          success: false,
          error: 'Failed to remove like'
        }, { status: 500 });
      }

      // Decrement likes count
      const { error: decrementError } = await supabase.rpc('decrement_comment_likes', { 
        comment_id: id 
      });

      if (decrementError) {
        console.error('Error decrementing likes:', decrementError);
      }

      return NextResponse.json({
        success: true,
        action: 'unliked'
      });
    }

    // Remove dislike if exists (switching from dislike to like)
    if (existingDislike) {
      const { error: deleteDislikeError } = await supabase
        .from('comment_reactions')
        .delete()
        .eq('comment_id', id)
        .eq('user_id', user.id)
        .eq('reaction_type', 'dislike');

      if (deleteDislikeError) {
        console.error('Error removing dislike:', deleteDislikeError);
      } else {
        // Decrement dislikes count
        await supabase.rpc('decrement_comment_dislikes', { 
          comment_id: id 
        });
      }
    }

    // Add the like
    const { error: insertError } = await supabase
      .from('comment_reactions')
      .insert({
        comment_id: id,
        user_id: user.id,
        reaction_type: 'like'
      });

    if (insertError) {
      console.error('Error adding like:', insertError);
      return NextResponse.json<{ success: boolean; error?: string }>({
        success: false,
        error: 'Failed to like comment'
      }, { status: 500 });
    }

    // Increment likes count
    const { error: incrementError } = await supabase.rpc('increment_comment_likes', { 
      comment_id: id 
    });

    if (incrementError) {
      console.error('Error incrementing likes:', incrementError);
    }

    return NextResponse.json({
      success: true,
      action: existingDislike ? 'switched_to_like' : 'liked'
    });
  } catch (error) {
    console.error('Error in like comment:', error);
    return NextResponse.json<{ success: boolean; error?: string }>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
