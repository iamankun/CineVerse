import { createClient } from '@/utils/supabase/client';

// Script kiểm tra trigger và profile creation
console.log('🔍 [DEBUG] Kiểm tra hệ thống đăng ký...');

const supabase = createClient();

async function checkSystem() {
  try {
    // 1. Kiểm tra trigger status
    console.log('\n📋 1. Kiểm tra trigger status...');
    
    // Test đăng ký user mới
    const testEmail = `debug-${Date.now()}@test.com`;
    const testPassword = 'DebugTest123!';
    
    console.log(`📧 Đang test đăng ký: ${testEmail}`);
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Debug User',
          username: 'debuguser'
        }
      }
    });
    
    if (signUpError) {
      console.error('❌ Lỗi đăng ký:', signUpError);
      return;
    }
    
    console.log('✅ Đăng ký thành công:', signUpData.user?.id);
    
    // 2. Chờ trigger chạy
    console.log('\n⏳ 2. Chờ trigger chạy (3 giây)...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 3. Kiểm tra profile
    console.log('\n🔍 3. Kiểm tra profile creation...');
    
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signUpData.user?.id);
    
    if (profileError) {
      console.error('❌ Lỗi truy vấn profile:', profileError);
    } else if (profiles && profiles.length > 0) {
      console.log('✅ Profile đã được tạo tự động:');
      console.log(`  📧 Email: ${profiles[0].email}`);
      console.log(`  👤 Full Name: ${profiles[0].full_name}`);
      console.log(`  🏷️ Username: ${profiles[0].username}`);
      console.log(`  👑 Role: ${profiles[0].role}`);
      console.log(`  ✅ Verify: ${profiles[0].verify}`);
      console.log('\n🎯 KẾT LUẬN: Trigger hoạt động bình thường!');
    } else {
      console.log('❌ Profile KHÔNG được tạo!');
      console.log('⚠️  Trigger có thể không hoạt động');
      console.log('📝 Cần kiểm tra:');
      console.log('   1. Trigger có được tạo trong Supabase SQL Editor?');
      console.log('   2. RLS policies có chặn không?');
      console.log('   3. Function handle_new_user có tồn tại không?');
    }
    
    // 4. Dọn dọn
    console.log('\n🧹 4. Dọn dọn test data...');
    await supabase.auth.signOut();
    
    console.log('\n✅ Kiểm tra hoàn tất!');
    
  } catch (error) {
    console.error('❌ Lỗi hệ thống:', error);
  }
}

checkSystem();
