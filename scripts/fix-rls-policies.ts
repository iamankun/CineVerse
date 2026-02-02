import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exsoflgvdreikabvhvkg.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c29mbGd2ZHJlaWthYnZodmtnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAzODQ3NiwiZXhwIjoyMDczNjE0NDc2fQ.GzCb1r9W2Y9G1QidElkxsTB6WKZ7KPH2HKB39nolbkY';

const supabase = createClient(supabaseUrl, serviceKey);

async function fixRLSPolicies() {
  console.log('🔧 Sửa RLS policies cho profiles và storage...');
  
  try {
    // 1. Kiểm tra và tạo RLS policies cho profiles
    console.log('\n📋 Kiểm tra RLS policies cho profiles...');
    
    // Enable RLS
    console.log('🔒 Enable RLS trên profiles table...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;'
    });
    
    if (rlsError) {
      console.log('⚠️ Không thể enable RLS qua script:', rlsError.message);
    } else {
      console.log('✅ RLS đã được enable');
    }
    
    // 2. Test RLS policies hiện tại
    console.log('\n🧪 Test RLS policies hiện tại...');
    
    // Test với client key
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c29mbGd2ZHJlaWthYnZodmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzg0NzYsImV4cCI6MjA3MzYxNDQ3Nn0.80qGLi5hEqLAHyY3-0eDgvxWf70oj7z7SimSA9V_ZUM';
    const clientSupabase = createClient(supabaseUrl, anonKey);
    
    // Test update với client key
    const { data: testProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (testProfile && testProfile.length > 0) {
      const testId = testProfile[0].id;
      
      console.log('🧪 Test update với client key...');
      const { data: updateResult, error: updateError } = await clientSupabase
        .from('profiles')
        .update({
          username: 'test_rls_' + Date.now()
        })
        .eq('id', testId)
        .select();
      
      if (updateError) {
        console.log('❌ RLS Error với client key:', updateError.message);
        
        if (updateError.message?.includes('row-level security')) {
          console.log('🔒 RLS đang chặn client-side operations');
          console.log('📝 Cần tạo proper RLS policies');
        }
      } else {
        console.log('✅ Client-side update hoạt động:', updateResult);
      }
    }
    
    // 3. Kiểm tra storage policies
    console.log('\n🪣 Kiểm tra storage policies...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.log('❌ Lỗi list buckets:', bucketError.message);
    } else {
      console.log('✅ Buckets:', buckets?.length || 0);
      
      const avatarsBucket = buckets?.find(b => b.name === 'avatars');
      if (avatarsBucket) {
        console.log('✅ Avatars bucket tồn tại');
        
        // Test upload với client key
        console.log('🧪 Test upload với client key...');
        const testFile = new Uint8Array([1, 2, 3]);
        const { data: uploadData, error: uploadError } = await clientSupabase.storage
          .from('avatars')
          .upload('test/test.txt', testFile);
        
        if (uploadError) {
          console.log('❌ Storage RLS Error:', uploadError.message);
          
          if (uploadError.message?.includes('row-level security')) {
            console.log('🔒 Storage RLS đang chặn upload');
            console.log('📝 Cần tạo storage policies');
          }
        } else {
          console.log('✅ Client-side upload hoạt động:', uploadData);
          
          // Xóa test file
          await supabase.storage
            .from('avatars')
            .remove(['test/test.txt']);
        }
      } else {
        console.log('❌ Avatars bucket không tồn tại');
      }
    }
    
    // 4. Cung cấp SQL commands để fix
    console.log('\n📝 SQL Commands để fix RLS policies:');
    console.log('```sql');
    console.log(`
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- Storage policies
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

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
    console.error('❌ Lỗi fix RLS:', error);
  }
}

fixRLSPolicies();
