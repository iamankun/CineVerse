import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Thiếu environment variables:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Bắt đầu setup database cho CineVerse Profile...');
  
  try {
    // 1. Kiểm tra và tạo profiles table
    console.log('📋 Kiểm tra profiles table...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'profiles');
    
    if (tablesError) {
      console.error('❌ Lỗi kiểm tra tables:', tablesError);
    } else if (!tables || tables.length === 0) {
      console.log('⚠️ Profiles table không tồn tại, cần tạo thủ công');
    } else {
      console.log('✅ Profiles table đã tồn tại');
    }
    
    // 2. Kiểm tra và tạo avatars bucket
    console.log('🪣 Kiểm tra avatars bucket...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Lỗi kiểm tra buckets:', bucketsError);
    } else {
      const avatarsBucket = buckets?.find(b => b.name === 'avatars');
      if (!avatarsBucket) {
        console.log('⚠️ Avatars bucket không tồn tại, đang tạo...');
        const { error: createError } = await supabase.storage.createBucket('avatars', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        });
        
        if (createError) {
          console.error('❌ Lỗi tạo bucket:', createError);
        } else {
          console.log('✅ Đã tạo avatars bucket');
        }
      } else {
        console.log('✅ Avatars bucket đã tồn tại');
      }
    }
    
    // 3. Kiểm tra RLS status
    console.log('🔒 Kiểm tra RLS status...');
    const { data: rlsStatus, error: rlsError } = await supabase
      .from('information_schema.table_privileges')
      .select('policy_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'profiles');
    
    if (rlsError) {
      console.error('❌ Lỗi kiểm tra RLS:', rlsError);
    } else {
      console.log('✅ RLS policies:', rlsStatus?.length || 0);
    }
    
    // 4. Test basic connection
    console.log('🔗 Kiểm tra kết nối...');
    const { data: testConnection, error: connectionError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Lỗi kết nối:', connectionError.message);
    } else {
      console.log('✅ Kết nối thành công');
    }
    
    console.log('\n🎉 Hoàn thành kiểm tra database!');
    console.log('\n📝 Các bước tiếp theo:');
    console.log('1. Mở Supabase Dashboard');
    console.log('2. Vào SQL Editor');
    console.log('3. Chạy file: database/profiles-rls-policies.sql');
    console.log('4. Chạy file: database/upsert-profile-function.sql');
    
  } catch (error) {
    console.error('❌ Lỗi setup:', error);
  }
}

setupDatabase();
