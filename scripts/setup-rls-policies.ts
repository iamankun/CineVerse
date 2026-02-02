import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exsoflgvdreikabvhvkg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c29mbGd2ZHJlaWthYnZodmtnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAzODQ3NiwiZXhwIjoyMDczNjE0NDc2fQ.GzCb1r9W2Y9G1QidElkxsTB6WKZ7KPH2HKB39nolbkY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupRLSAndBucketPolicies() {
  console.log('🔐 Thiết lập RLS và Storage Policies...');
  
  try {
    // 1. Kiểm tra RLS status
    console.log('\n📋 Kiểm tra RLS status...');
    const { data: rlsStatus, error: rlsError } = await supabase
      .from('pg_policies')
      .select('policyname, tablename, permissive, roles, cmd')
      .eq('tablename', 'profiles');
    
    if (rlsError) {
      console.log('❌ Lỗi kiểm tra RLS:', rlsError.message);
    } else {
      console.log('✅ RLS policies hiện có:', rlsStatus?.length || 0);
      rlsStatus?.forEach(policy => {
        console.log(`  - ${policy.policyname} (${policy.cmd})`);
      });
    }
    
    // 2. Kiểm tra storage policies
    console.log('\n🪣 Kiểm tra Storage Policies...');
    const { data: storagePolicies, error: storageError } = await supabase
      .from('storage.policies')
      .select('*')
      .eq('bucket_id', 'avatars');
    
    if (storageError) {
      console.log('❌ Lỗi kiểm tra storage policies:', storageError.message);
    } else {
      console.log('✅ Storage policies hiện có:', storagePolicies?.length || 0);
      storagePolicies?.forEach(policy => {
        console.log(`  - ${policy.name} (${policy.definition})`);
      });
    }
    
    // 3. Test RLS functionality
    console.log('\n🧪 Test RLS functionality...');
    
    // Test với user không tồn tại
    const { error: testError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000000');
    
    if (testError?.message?.includes('no rows returned')) {
      console.log('✅ RLS SELECT hoạt động (không trả về data cho user không tồn tại)');
    }
    
    // Test update với user không tồn tại
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ username: 'test' })
      .eq('id', '00000000-0000-0000-0000-000000000000');
    
    if (updateError?.message?.includes('no rows returned')) {
      console.log('✅ RLS UPDATE hoạt động (không update được user không tồn tại)');
    }
    
    // 4. Test storage policies
    console.log('\n📷 Test Storage Policies...');
    
    // Test upload với user không tồn tại
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload('test/test.jpg', new Uint8Array([1, 2, 3]));
    
    if (uploadError?.message?.includes('new row violates row-level security policy')) {
      console.log('✅ Storage RLS hoạt động (chặn upload user không tồn tại)');
    }
    
    // 5. Generate SQL commands if needed
    console.log('\n📝 SQL Commands cần chạy (nếu policies chưa có):');
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

-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Create storage policies cho avatars bucket
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own avatar" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
    `);
    console.log('```');
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
}

setupRLSAndBucketPolicies();
