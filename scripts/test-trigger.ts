import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exsoflgvdreikabvhvkg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c29mbGd2ZHJlaWthYnZodmtnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAzODQ3NiwiZXhwIjoyMDczNjE0NDc6fQ.GzCb1r9W2Y9G1QidElkxsTB6WKZ7KPH2HKB39nolbkY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testTrigger() {
  console.log('🧪 Kiểm tra trigger tự động tạo profile...');
  
  try {
    // Tạo user test
    const testEmail = `test-trigger-${Date.now()}@cineverse.local`;
    const testPassword = 'Test123456!';
    
    console.log('📝 Đang tạo user test:', testEmail);
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Test Trigger User',
        username: `test_user_${Date.now()}`
      }
    });
    
    if (authError) {
      console.log('❌ Lỗi tạo user:', authError.message);
      return;
    }
    
    console.log('✅ Đã tạo user test:', authData.user?.id);
    
    // Đợi 2 giây để trigger chạy
    console.log('⏳ Đợi trigger chạy...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Kiểm tra profile được tạo tự động
    console.log('🔍 Kiểm tra profile được tạo...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user?.id)
      .single();
    
    if (profileError) {
      console.log('❌ Profile không được tạo tự động:', profileError.message);
      console.log('🔍 Kiểm tra trigger có tồn tại không...');
      
      // Kiểm tra trigger
      const { data: triggers, error: triggerError } = await supabase
        .from('information_schema.triggers')
        .select('trigger_name, event_manipulation, event_object_table')
        .eq('trigger_name', 'on_auth_user_created');
      
      if (triggerError) {
        console.log('❌ Lỗi kiểm tra trigger:', triggerError.message);
      } else {
        console.log('📋 Triggers tìm thấy:', triggers?.length || 0);
        triggers?.forEach(t => {
          console.log(`  - ${t.trigger_name}: ${t.event_manipulation} on ${t.event_object_table}`);
        });
      }
      
      // Kiểm tra function
      const { data: functions, error: functionError } = await supabase
        .from('information_schema.routines')
        .select('routine_name, routine_type')
        .eq('routine_name', 'handle_new_user');
      
      if (functionError) {
        console.log('❌ Lỗi kiểm tra function:', functionError.message);
      } else {
        console.log('🔧 Functions tìm thấy:', functions?.length || 0);
        functions?.forEach(f => {
          console.log(`  - ${f.routine_name}: ${f.routine_type}`);
        });
      }
      
    } else {
      console.log('🎉 SUCCESS! Profile được tạo tự động:');
      console.log({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        username: profile.username,
        role: profile.role,
        verify: profile.verify
      });
    }
    
    // Dọn dẹp - xóa test user
    console.log('🗑️ Dọn dẹp test user...');
    await supabase.auth.admin.deleteUser(authData.user?.id);
    
    // Xóa profile nếu có
    if (profile) {
      await supabase
        .from('profiles')
        .delete()
        .eq('id', authData.user?.id);
    }
    
    console.log('✅ Đã dọn dẹp hoàn tất');
    
  } catch (error) {
    console.error('❌ Lỗi test:', error);
  }
}

testTrigger();
