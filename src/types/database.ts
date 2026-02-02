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
      // Add other tables here as needed
    };
  };
}
