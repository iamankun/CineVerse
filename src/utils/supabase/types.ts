export type Database = {
  public: {
    Tables: {
      notes: {
        Row: {
          id: number;
          title: string;
        };
        Insert: {
          id?: number;
          title: string;
        };
        Update: {
          id?: number;
          title?: string;
        };
      };
      histories: {
        Row: {
          id: number;
          user_id: string;
          media_id: number;
          title: string;
          type: string;
          poster_path: string | null;
          backdrop_path: string | null;
          release_date: string;
          vote_average: number;
          adult: boolean;
          episode: number;
          duration: number;
          last_position: number;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          media_id: number;
          title: string;
          type: string;
          poster_path?: string | null;
          backdrop_path?: string | null;
          release_date: string;
          vote_average: number;
          adult: boolean;
          episode?: number;
          duration?: number;
          last_position?: number;
          completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          media_id?: number;
          title?: string;
          type?: string;
          poster_path?: string | null;
          backdrop_path?: string | null;
          release_date?: string;
          vote_average?: number;
          adult?: boolean;
          episode?: number;
          duration?: number;
          last_position?: number;
          completed?: boolean;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          username: string | null;
          avatar_url: string | null;
          full_name: string | null;
          bio: string | null;
          website: string | null;
          location: string | null;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          avatar_url?: string | null;
          full_name?: string | null;
          bio?: string | null;
          website?: string | null;
          location?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          avatar_url?: string | null;
          full_name?: string | null;
          bio?: string | null;
          website?: string | null;
          location?: string | null;
          updated_at?: string;
        };
      };
      watchlist: {
        Row: {
          id: number;
          user_id: string;
          media_id: number;
          title: string;
          type: string;
          poster_path: string | null;
          backdrop_path: string | null;
          release_date: string;
          vote_average: number;
          adult: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          media_id: number;
          title: string;
          type: string;
          poster_path?: string | null;
          backdrop_path?: string | null;
          release_date: string;
          vote_average: number;
          adult: boolean;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          media_id?: number;
          title?: string;
          type?: string;
          poster_path?: string | null;
          backdrop_path?: string | null;
          release_date?: string;
          vote_average?: number;
          adult?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};