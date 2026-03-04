import { createClient } from "@/utils/supabase/server";
import { Database } from "@/types/database";
import { CommentWithReplies, CommentsResponse, CreateCommentRequest } from "@/types/comment";
import { NextRequest, NextResponse } from "next/server";

type CommentRow = Database['public']['Tables']['comments']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get('movie_id');
    const tvId = searchParams.get('tv_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!movieId && !tvId) {
      return NextResponse.json<CommentsResponse>({
        success: false,
        error: 'Movie ID or TV ID is required'
      }, { status: 400 });
    }

    const offset = (page - 1) * limit;

    // Fetch main comments (no parent_id)
    let query = supabase
      .from('comments')
      .select(`
        *,
        user:profiles(username, avatar_url, role, verify)
      `)
      .eq('is_deleted', false)
      .is('parent_id', null)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (movieId) {
      query = query.eq('movie_id', parseInt(movieId));
    } else if (tvId) {
      query = query.eq('tv_id', parseInt(tvId));
    }

    const { data: comments, error } = await query;

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json<CommentsResponse>({
        success: false,
        error: 'Failed to fetch comments'
      }, { status: 500 });
    }

    // Fetch replies for each comment
    const commentsWithReplies: CommentWithReplies[] = await Promise.all(
      (comments || []).map(async (comment: any) => {
        const { data: replies } = await supabase
          .from('comments')
          .select(`
            *,
            user:profiles(username, avatar_url, role, verify)
          `)
          .eq('parent_id', comment.id)
          .eq('is_deleted', false)
          .order('created_at', { ascending: true });

        return {
          ...comment,
          user_profile: comment.user || null,
          replies: (replies || []).map((reply: any) => ({
            ...reply,
            user_profile: reply.user || null
          }))
        };
      })
    );

    // Get total count
    let countQuery = supabase
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('is_deleted', false)
      .is('parent_id', null);

    if (movieId) {
      countQuery = countQuery.eq('movie_id', parseInt(movieId));
    } else if (tvId) {
      countQuery = countQuery.eq('tv_id', parseInt(tvId));
    }

    const { count } = await countQuery;

    return NextResponse.json<CommentsResponse>({
      success: true,
      data: commentsWithReplies,
      total: count || 0
    });

  } catch (error) {
    console.error('Error in comments GET:', error);
    return NextResponse.json<CommentsResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body: CreateCommentRequest = await request.json();

    const { movie_id, tv_id, content, parent_id } = body;

    if (!movie_id && !tv_id) {
      return NextResponse.json<{ success: boolean; error?: string }>({
        success: false,
        error: 'Movie ID or TV ID is required'
      }, { status: 400 });
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json<{ success: boolean; error?: string }>({
        success: false,
        error: 'Comment content is required'
      }, { status: 400 });
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (!user || authError) {
      return NextResponse.json<{ success: boolean; error?: string }>({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    // Get user profile
    let profile = null;
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();
      profile = profileData;
    } catch (error) {
      // Profile not found, create one
    }

    // Create profile if not exists
    if (!profile) {
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: user.email?.split('@')[0] || 'Anonymous',
          full_name: user.email?.split('@')[0] || 'Anonymous',
          avatar_url: null,
        })
        .select('username, avatar_url')
        .single();

      if (profileError) {
        // Continue with fallback data
        profile = { username: user.email?.split('@')[0] || 'Anonymous', avatar_url: null };
      } else {
        profile = newProfile;
      }
    }

    // Create comment
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        movie_id,
        tv_id,
        user_id: user.id,
        username: (profile as any)?.username || user.email?.split('@')[0] || 'Anonymous',
        user_avatar: (profile as any)?.avatar_url,
        content: content.trim(),
        parent_id
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json<{ success: boolean; error?: string }>({
        success: false,
        error: 'Failed to create comment'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...comment,
        user: profile
      }
    });

  } catch (error) {
    console.error('Error in comments POST:', error);
    return NextResponse.json<{ success: boolean; error?: string }>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
