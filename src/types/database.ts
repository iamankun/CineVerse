// Database types for CineVerse
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'member' | 'admin';
  created_at: string;
  verify: string;
  username?: string;
  bio?: string;
  website?: string;
  location?: string;
  avatar_url?: string;
  public_profile?: boolean;
  updated_at?: string;
}

// Comment types
export interface Comment {
  id: string;
  movie_id: number | null;
  tv_id: number | null;
  user_id: string;
  username: string;
  user_avatar: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  likes: number;
  dislikes: number;
  parent_id: string | null;
  is_deleted: boolean;
  is_pinned: boolean;
}

export type CommentRow = Comment;
export type CommentInsert = Omit<Comment, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};
export type CommentUpdate = Partial<Comment>;

// Supabase types
export type ProfileRow = Profile;
export type ProfileInsert = Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
export type ProfileUpdate = Partial<Pick<Profile, 'id' | 'created_at'>>;

// Database schema type
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      comments: {
        Row: CommentRow;
        Insert: CommentInsert;
        Update: CommentUpdate;
      };
    };
  };
}
