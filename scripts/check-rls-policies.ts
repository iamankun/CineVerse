import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exsoflgvdreikabvhvkg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c29mbGd2ZHJlaWthYnZodmtnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAzODQ3NiwiZXhwIjoyMDczNjE0NDc2fQ.GzCb1r9W2Y9G1QidElkxsTB6WKZ7KPH2HKB39nolbkY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndFixRLS() {
  console.log('🔍 Kiểm tra và sửa RLS policies...');
  
  try {
    // 1. Kiểm tra RLS status
    console.log('\n📋 Kiểm tra RLS status...');
    const { data: rlsStatus, error: rlsError } = await supabase
      .from('information_schema.table_privileges')
      .select('table_name, grantee, privilege_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'profiles');
    
    if (rlsError) {
      console.log('❌ Lỗi kiểm tra RLS:', rlsError.message);
    } else {
      console.log('✅ RLS privileges:', rlsStatus?.length || 0);
      rlsStatus?.forEach(priv => {
        console.log(`  - ${priv.grantee}: ${priv.privilege_type}`);
      });
    }
    
    // 2. Test client-side update (mô phỏng)
    console.log('\n🧪 Test client-side update...');
    
    // Tạo client với anon key (giống client-side)
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c29mbGd2ZHJlaWthYnZodmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzg0NzYsImV4cCI6MjA3MzYxNDQ3Nn0.80qGLi5hEqLAHyY3-0eDgvxWf70oj7z7SimSA9V_ZUM';
    const clientSupabase = createClient(supabaseUrl, anonKey);
    
    // Test với user đã đăng nhập (mô phỏng)
    const testUserId = 'd86d773b-904a-4148-b036-be2925e07089';
    
    const { data: updateResult, error: updateError } = await clientSupabase
      .from('profiles')
      .update({
        username: 'test_client_update',
        bio: 'Test from client side'
      })
      .eq('id', testUserId)
      .select();
    
    if (updateError) {
      console.log('❌ Client-side update error:', updateError.message);
      
      if (updateError.message?.includes('row-level security')) {
        console.log('🔒 RLS đang chặn client-side update');
        console.log('\n📝 Cần chạy SQL sau trong Supabase SQL Editor:');
        console.log('```sql');
        console.log(`
-- Enable RLS trên profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;

-- Create RLS policies cho profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" ON profiles
  FOR DELETE USING (auth.uid() = id);
        `);
        console.log('```');
      }
    } else {
      console.log('✅ Client-side update thành công:', updateResult);
    }
    
    // 3. Kiểm tra auto-trigger khi tạo user
    console.log('\n🔄 Kiểm tra auto-trigger cho user mới...');
    console.log('Cần tạo trigger để tự động tạo profile khi user đăng ký');
    console.log('\n📝 SQL để tạo trigger:');
    console.log('```sql');
    console.log(`
-- Tạo function để tự động tạo profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tạo trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
    `);
    console.log('```');
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
}

checkAndFixRLS();
