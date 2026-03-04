import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    // Get user's comments to find replies
    const { data: userComments } = await supabase
      .from('comments')
      .select('id')
      .eq('user_id', user.id);

    if (!userComments || userComments.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        replies: []
      });
    }

    const commentIds = userComments.map(c => c.id);

    // Find replies to user's comments (excluding user's own replies)
    const { data: replies, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:profiles(username, avatar_url, role, verify)
      `)
      .in('parent_id', commentIds)
      .eq('is_deleted', false)
      .neq('user_id', user.id) // Exclude user's own replies
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching replies:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch replies'
      }, { status: 500 });
    }

    // Format replies with notification info
    const formattedReplies = (replies || []).map((reply: any) => ({
      id: reply.id,
      type: 'reply',
      title: `${reply.user?.username || 'Someone'} đã trả lời bình luận của bạn`,
      message: reply.content,
      user: reply.user,
      createdAt: reply.created_at,
      movieId: reply.movie_id,
      tvId: reply.tv_id,
      read: false // We'll need to implement read status
    }));

    return NextResponse.json({
      success: true,
      count: formattedReplies.length,
      replies: formattedReplies
    });

  } catch (error) {
    console.error('Error in reply notifications API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
