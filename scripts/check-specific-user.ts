import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exsoflgvdreikabvhvkg.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c29mbGd2ZHJlaWthYnZodmtnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAzODQ3NiwiZXhwIjoyMDczNjE0NDc2fQ.GzCb1r9W2Y9G1QidElkxsTB6WKZ7KPH2HKB39nolbkY';

const supabase = createClient(supabaseUrl, serviceKey);

async function checkSpecificUser() {
  console.log('🔍 Kiểm tra tài khoản ankun.n.m@gmail.com...');
  
  try {
    // 1. Tìm user ID từ email
    console.log('\n📧 Tìm user ID từ email...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Lỗi lấy danh sách users:', authError.message);
      return;
    }
    
    const targetUser = authUsers.users.find(u => u.email === 'ankun.n.m@gmail.com');
    
    if (!targetUser) {
      console.log('❌ Không tìm thấy user ankun.n.m@gmail.com');
      console.log('📋 Danh sách users:');
      authUsers.users.forEach(u => {
        console.log(`  - ${u.email} (${u.id})`);
      });
      return;
    }
    
    console.log('✅ Tìm thấy user:', {
      id: targetUser.id,
      email: targetUser.email,
      created_at: targetUser.created_at
    });
    
    // 2. Kiểm tra profile hiện tại
    console.log('\n📋 Kiểm tra profile hiện tại...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetUser.id)
      .single();
    
    if (profileError) {
      console.log('❌ Lỗi fetch profile:', profileError.message);
      
      if (profileError.message?.includes('No rows returned')) {
        console.log('🔍 User này chưa có profile - cần tạo profile');
        
        // Tạo profile cho user này
        console.log('🔧 Tạo profile cho user...');
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: targetUser.id,
            email: targetUser.email,
            full_name: targetUser.user_metadata?.full_name || 'An Kun',
            username: targetUser.user_metadata?.username || 'ankun',
            role: 'member',
            verify: 'true'
          })
          .select()
          .single();
        
        if (createError) {
          console.log('❌ Lỗi tạo profile:', createError.message);
        } else {
          console.log('✅ Đã tạo profile mới:', newProfile);
        }
      }
    } else {
      console.log('✅ Profile hiện tại:', {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        username: profile.username,
        bio: profile.bio,
        website: profile.website,
        location: profile.location,
        avatar_url: profile.avatar_url
      });
    }
    
    // 3. Test cập nhật với service key
    console.log('\n✏️ Test cập nhật với service key...');
    const testUpdate = {
      username: 'ankun_test_' + Date.now(),
      full_name: 'An Kun Updated',
      bio: 'Updated via service key test',
      website: 'https://ankun.dev',
      location: 'Viet Nam'
    };
    
    const { data: updateResult, error: updateError } = await supabase
      .from('profiles')
      .update(testUpdate)
      .eq('id', targetUser.id)
      .select()
      .single();
    
    if (updateError) {
      console.log('❌ Lỗi cập nhật với service key:', updateError.message);
    } else {
      console.log('✅ Cập nhật thành công với service key:', updateResult);
    }
    
    // 4. Kiểm tra lại sau cập nhật
    console.log('\n🔍 Kiểm tra lại sau cập nhật...');
    const { data: finalProfile, error: finalError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetUser.id)
      .single();
    
    if (finalError) {
      console.log('❌ Lỗi fetch final:', finalError.message);
    } else {
      console.log('✅ Profile cuối cùng:', {
        id: finalProfile.id,
        email: finalProfile.email,
        full_name: finalProfile.full_name,
        username: finalProfile.username,
        bio: finalProfile.bio,
        website: finalProfile.website,
        location: finalProfile.location,
        avatar_url: finalProfile.avatar_url
      });
    }
    
    // 5. Test với client key (anon key)
    console.log('\n🔒 Test với client key (mô phỏng user login)...');
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c29mbGd2ZHJlaWthYnZodmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzg0NzYsImV4cCI6MjA3MzYxNDQ3Nn0.80qGLi5hEqLAHyY3-0eDgvxWf70oj7z7SimSA9V_ZUM';
    const clientSupabase = createClient(supabaseUrl, anonKey);
    
    // Mô phỏng login bằng cách set session
    const { error: sessionError } = await clientSupabase.auth.setSession({
      access_token: 'mock_token',
      refresh_token: 'mock_refresh'
    });
    
    const clientTestUpdate = {
      username: 'client_test_' + Date.now(),
      bio: 'Client test update'
    };
    
    const { data: clientResult, error: clientError } = await clientSupabase
      .from('profiles')
      .update(clientTestUpdate)
      .eq('id', targetUser.id)
      .select();
    
    if (clientError) {
      console.log('❌ Lỗi cập nhật với client key:', clientError.message);
      console.log('🔍 Đây là vấn đề RLS - client không có quyền');
    } else {
      console.log('✅ Cập nhật thành công với client key:', clientResult);
    }
    
  } catch (error) {
    console.error('❌ Lỗi kiểm tra:', error);
  }
}

checkSpecificUser();
