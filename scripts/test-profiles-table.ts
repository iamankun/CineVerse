import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exsoflgvdreikabvhvkg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c29mbGd2ZHJlaWthYnZodmtnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAzODQ3NiwiZXhwIjoyMDczNjE0NDc2fQ.GzCb1r9W2Y9G1QidElkxsTB6WKZ7KPH2HKB39nolbkY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testProfilesTable() {
  console.log('🧪 Kiểm tra profiles table...');
  
  try {
    // Test insert một record để xem table có tồn tại không
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: '00000000-0000-0000-0000-000000000000', // Test UUID
        username: 'test_user',
        full_name: 'Test User'
      });
    
    if (error) {
      if (error.message?.includes('relation "profiles" does not exist')) {
        console.log('❌ Profiles table không tồn tại');
        console.log('\n📝 Bạn cần tạo profiles table thủ công:');
        console.log('1. Mở Supabase Dashboard');
        console.log('2. Vào SQL Editor');
        console.log('3. Paste và chạy SQL sau:');
        console.log(`
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  bio TEXT,
  website TEXT,
  location TEXT,
  avatar_url TEXT,
  public_profile BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Create upsert function
CREATE OR REPLACE FUNCTION upsert_profile(
  p_id UUID,
  p_username TEXT DEFAULT NULL,
  p_full_name TEXT DEFAULT NULL,
  p_bio TEXT DEFAULT NULL,
  p_website TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL,
  p_public_profile BOOLEAN DEFAULT true
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (
    id, 
    username, 
    full_name, 
    bio, 
    website, 
    location, 
    avatar_url, 
    public_profile,
    updated_at
  ) VALUES (
    p_id,
    p_username,
    p_full_name,
    p_bio,
    p_website,
    p_location,
    p_avatar_url,
    p_public_profile,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    full_name = EXCLUDED.full_name,
    bio = EXCLUDED.bio,
    website = EXCLUDED.website,
    location = EXCLUDED.location,
    avatar_url = EXCLUDED.avatar_url,
    public_profile = EXCLUDED.public_profile,
    updated_at = NOW();
END;
$$;

GRANT EXECUTE ON FUNCTION upsert_profile TO authenticated;
        `);
      } else {
        console.log('✅ Profiles table đã tồn tại nhưng có lỗi khác:', error.message);
      }
    } else {
      console.log('✅ Profiles table đã tồn tại và hoạt động!');
      
      // Xóa test record
      await supabase
        .from('profiles')
        .delete()
        .eq('id', '00000000-0000-0000-0000-000000000000');
    }
    
  } catch (error) {
    console.error('❌ Lỗi test:', error);
  }
}

testProfilesTable();
