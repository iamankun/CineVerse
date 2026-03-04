import { createClient } from "@/utils/supabase/server";
import { Database } from "@/types/database";
import { UpdateCommentRequest } from "@/types/comment";
import { NextRequest, NextResponse } from "next/server";

type CommentRow = Database['public']['Tables']['comments']['Row'];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const body: UpdateCommentRequest = await request.json();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json<{ success: boolean; error?: string }>({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    // Check if user owns the comment
    const { data: comment } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!comment) {
      return NextResponse.json<{ success: boolean; error?: string }>({
        success: false,
        error: 'Comment not found'
      }, { status: 404 });
    }

    if (comment.user_id !== user.id) {
      return NextResponse.json<{ success: boolean; error?: string }>({
        success: false,
        error: 'Permission denied'
      }, { status: 403 });
    }

    // Update comment
    const { data: updatedComment, error } = await supabase
      .from('comments')
      .update({
        content: body.content.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating comment:', error);
      return NextResponse.json<{ success: boolean; error?: string }>({
        success: false,
        error: 'Failed to update comment'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: updatedComment
    });

  } catch (error) {
    console.error('Error in comments PUT:', error);
    return NextResponse.json<{ success: boolean; error?: string }>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    console.log('DELETE comment - ID:', id);
    console.log('ID type:', typeof id);
    console.log('ID length:', id?.length);

    // Debug: Check if any comments exist
    const { data: allComments, error: allError } = await supabase
      .from('comments')
      .select('id, content, user_id, is_deleted')
      .limit(5);

    console.log('All comments in DB:', { 
      count: allComments?.length, 
      error: allError,
      sampleIds: allComments?.map(c => ({ id: c.id, content: c.content?.substring(0, 30) }))
    });

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json<{ success: boolean; error?: string }>({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    console.log('User authenticated:', user.id);

    // Check if user owns the comment
    console.log('Querying comment with ID:', id);
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('user_id, content, is_deleted')
      .eq('id', id)
      .single();

    console.log('Comment query result:', { 
      comment, 
      commentError,
      errorCode: commentError?.code,
      errorMessage: commentError?.message,
      errorDetails: commentError?.details
    });

    // Try without .single() to see if multiple results
    const { data: allMatchingComments, error: matchingError } = await supabase
      .from('comments')
      .select('id, content, is_deleted')
      .eq('id', id);

    console.log('All matching comments:', {
      count: allMatchingComments?.length,
      error: matchingError,
      comments: allMatchingComments
    });

    if (!comment || commentError) {
      console.log('Comment not found or error:', commentError);
      return NextResponse.json<{ success: boolean; error?: string }>({
        success: false,
        error: 'Comment not found'
      }, { status: 404 });
    }

    if (comment.user_id !== user.id) {
      console.log('Permission denied - comment.user_id:', comment.user_id, 'user.id:', user.id);
      return NextResponse.json<{ success: boolean; error?: string }>({
        success: false,
        error: 'Permission denied'
      }, { status: 403 });
    }

    // Hard delete comment
    console.log('Hard deleting comment:', id);

    // Delete comment reactions first (foreign key constraint)
    const { error: reactionsError } = await supabase
      .from('comment_reactions')
      .delete()
      .eq('comment_id', id);

    if (reactionsError) {
      console.error('Error deleting comment reactions:', reactionsError);
      // Continue with comment deletion even if reactions deletion fails
    }

    // Delete the comment
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting comment:', error);
      return NextResponse.json<{ success: boolean; error?: string }>({
        success: false,
        error: 'Failed to delete comment'
      }, { status: 500 });
    }

    console.log('Comment deleted successfully:', id);

    return NextResponse.json({
      success: true
    });

  } catch (error) {
    console.error('Error in comments DELETE:', error);
    return NextResponse.json<{ success: boolean; error?: string }>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
