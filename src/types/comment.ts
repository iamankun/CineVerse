export interface Comment {
  id: string;
  movie_id: number;
  tv_id?: number;
  user_id: string;
  username: string;
  user_avatar?: string;
  user_profile?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
    role?: string;
    verify?: string;
  };
  content: string;
  created_at: string;
  updated_at: string;
  likes: number;
  dislikes: number;
  parent_id?: string; // For replies
  is_deleted: boolean;
  is_pinned: boolean;
}

export interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies[];
}

export interface CommentReaction {
  id: string;
  comment_id: string;
  user_id: string;
  type: 'like' | 'dislike';
  created_at: string;
}

export interface CreateCommentRequest {
  movie_id?: number;
  tv_id?: number;
  content: string;
  parent_id?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface CommentResponse {
  success: boolean;
  data?: Comment;
  error?: string;
}

export interface CommentsResponse {
  success: boolean;
  data?: CommentWithReplies[];
  total?: number;
  error?: string;
}
