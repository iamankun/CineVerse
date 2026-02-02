import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exsoflgvdreikabvhvkg.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c29mbGd2ZHJlaWthYnZodmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzg0NzYsImV4cCI6MjA3MzYxNDQ3Nn0.80qGLi5hEqLAHyY3-0eDgvxWf70oj7z7SimSA9V_ZUM';

const supabase = createClient(supabaseUrl, anonKey);

async function testProfileUpdate() {
  console.log('🧪 Kiểm tra cập nhật profile data...');
  
  try {
    // 1. Login để có session
    console.log('🔐 Đăng nhập với user test...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'ankunstudio@ankun.dev',
      password: '@iamAnKun'
    });
    
    if (loginError) {
      console.log('❌ Lỗi login:', loginError.message);
      return;
    }
    
    console.log('✅ Login thành công:', loginData.user?.id);
    
    // 2. Lấy profile hiện tại
    console.log('\n📋 Lấy profile hiện tại...');
    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', loginData.user?.id)
      .single();
    
    if (fetchError) {
      console.log('❌ Lỗi fetch profile:', fetchError.message);
      console.log('🔍 Chi tiết lỗi:', {
        code: fetchError.code,
        details: fetchError.details,
        hint: fetchError.hint
      });
      return;
    }
    
    console.log('✅ Profile hiện tại:', {
      id: currentProfile.id,
      email: currentProfile.email,
      full_name: currentProfile.full_name,
      username: currentProfile.username,
      bio: currentProfile.bio,
      website: currentProfile.website,
      location: currentProfile.location,
      avatar_url: currentProfile.avatar_url
    });
    
    // 3. Test cập nhật profile
    console.log('\n✏️ Test cập nhật profile...');
    const updateData = {
      username: 'test_update_' + Date.now(),
      full_name: 'Test Update Name',
      bio: 'Test bio from script',
      website: 'https://test-update.com',
      location: 'Test Location'
    };
    
    console.log('📝 Dữ liệu cập nhật:', updateData);
    
    const { data: updateResult, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', loginData.user?.id)
      .select()
      .single();
    
    if (updateError) {
      console.log('❌ Lỗi cập nhật profile:', updateError.message);
      console.log('🔍 Chi tiết lỗi:', {
        code: updateError.code,
        details: updateError.details,
        hint: updateError.hint,
        message: updateError.message
      });
      
      // Kiểm tra xem có phải RLS issue không
      if (updateError.message?.includes('row-level security')) {
        console.log('🔒 Đây là lỗi RLS - User không có quyền cập nhật');
        console.log('📝 Cần kiểm tra RLS policies');
      }
      
      return;
    }
    
    console.log('✅ Cập nhật thành công:', updateResult);
    
    // 4. Kiểm tra lại dữ liệu sau khi cập nhật
    console.log('\n🔍 Kiểm tra lại dữ liệu...');
    const { data: updatedProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', loginData.user?.id)
      .single();
    
    if (verifyError) {
      console.log('❌ Lỗi verify:', verifyError.message);
    } else {
      console.log('✅ Dữ liệu sau khi cập nhật:', {
        id: updatedProfile.id,
        username: updatedProfile.username,
        full_name: updatedProfile.full_name,
        bio: updatedProfile.bio,
        website: updatedProfile.website,
        location: updatedProfile.location
      });
    }
    
    // 5. Logout
    await supabase.auth.signOut();
    console.log('\n👋 Đã logout');
    
  } catch (error) {
    console.error('❌ Lỗi test:', error);
  }
}

testProfileUpdate();
