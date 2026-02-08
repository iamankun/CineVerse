import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exsoflgvdreikabvhvkg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c29mbGd2ZHJlaWthYnZodmtnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAzODQ3NiwiZXhwIjoyMDczNjE0NDc2fQ.GzCb1r9W2Y9G1QidElkxsTB6WKZ7KPH2HKB39nolbkY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSignUp() {
  console.log('🔍 Bắt đầu test đăng ký...');
  
  try {
    // 1. Tạo user test
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    console.log(`📧 Đang tạo user: ${testEmail}`);
    
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (signUpError) {
      console.error('❌ Lỗi đăng ký:', signUpError);
      return;
    }
    
    console.log('✅ Đăng ký thành công:', authData.user?.id);
    
    // 2. Kiểm tra profile đã được tạo chưa
    console.log('🔍 Kiểm tra profile...');
    
    // Chờ 2 giây để trigger chạy
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user?.id);
    
    if (profileError) {
      console.error('❌ Lỗi kiểm tra profile:', profileError);
    } else if (profiles && profiles.length > 0) {
      console.log('✅ Profile đã được tạo tự động:');
      console.log(`  - Email: ${profiles[0].email}`);
      console.log(`  - Full Name: ${profiles[0].full_name}`);
      console.log(`  - Username: ${profiles[0].username}`);
      console.log(`  - Role: ${profiles[0].role}`);
      console.log(`  - Verify: ${profiles[0].verify}`);
    } else {
      console.log('❌ Profile không được tạo! Trigger không hoạt động.');
      
      // 3. Tạo profile thủ công
      console.log('🔧 Tạo profile thủ công...');
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user?.id,
          email: authData.user?.email,
          full_name: authData.user?.user_metadata?.full_name || testEmail.split('@')[0],
          username: testEmail.split('@')[0],
          role: 'member',
          verify: 'false'
        });
      
      if (insertError) {
        console.error('❌ Lỗi tạo profile thủ công:', insertError);
      } else {
        console.log('✅ Đã tạo profile thủ công');
      }
    }
    
    // 4. Dọn dọn user test
    console.log('🧹 Dọn dọn user test...');
    await supabase.auth.signOut();
    
  } catch (error) {
    console.error('❌ Lỗi test:', error);
  }
}

testSignUp();
