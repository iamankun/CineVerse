import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exsoflgvdreikabvhvkg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c29mbGd2ZHJlaWthYnZodmtnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAzODQ3NiwiZXhwIjoyMDczNjE0NDc2fQ.GzCb1r9W2Y9G1QidElkxsTB6WKZ7KPH2HKB39nolbkY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkProfilesStructure() {
  console.log('🔍 Kiểm tra cấu trúc profiles table...');
  
  try {
    // Lấy thông tin columns
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Lỗi truy vấn profiles:', error.message);
      
      // Kiểm tra xem có column nào không
      if (error.message?.includes('column')) {
        console.log('\n📝 Cần thêm columns vào profiles table:');
        console.log('Chạy SQL sau trong Supabase SQL Editor:');
        console.log(`
-- Thêm các columns cần thiết
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS public_profile BOOLEAN DEFAULT true;

-- Tạo upsert function
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
      }
    } else {
      console.log('✅ Profiles table hoạt động bình thường!');
      console.log('📊 Data:', data);
    }
    
    // Kiểm tra RLS
    console.log('\n🔒 Kiểm tra RLS...');
    const testUser = {
      id: '00000000-0000-0000-0000-000000000000',
      username: 'test_rls'
    };
    
    const { error: rlsError } = await supabase
      .from('profiles')
      .insert(testUser);
    
    if (rlsError?.message?.includes('row-level security')) {
      console.log('✅ RLS đã được enable (chặn insert không hợp lệ)');
    } else if (rlsError) {
      console.log('⚠️ RLS error khác:', rlsError.message);
    } else {
      console.log('⚠️ RLS có thể chưa được enable hoặc có vấn đề');
      // Xóa test record
      await supabase
        .from('profiles')
        .delete()
        .eq('id', testUser.id);
    }
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
}

checkProfilesStructure();
