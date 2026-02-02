import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exsoflgvdreikabvhvkg.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c29mbGd2ZHJlaWthYnZodmtnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAzODQ3NiwiZXhwIjoyMDczNjE0NDc2fQ.GzCb1r9W2Y9G1QidElkxsTB6WKZ7KPH2HKB39nolbkY';

const supabase = createClient(supabaseUrl, serviceKey);

async function createAutoProfileTrigger() {
  console.log('🔧 Tạo trigger tự động tạo profile khi user đăng ký...');
  
  try {
    // 1. Tạo function để tự động tạo profile
    console.log('\n📝 Tạo function handle_new_user...');
    const functionSQL = `
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO public.profiles (id, email, full_name, username, role, verify, public_profile)
        VALUES (
          NEW.id,
          NEW.email,
          COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
          COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
          'member',
          'false',
          true
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    // Không thể dùng exec_sql, nên sẽ cung cấp SQL để chạy thủ công
    console.log('❌ Không thể tạo function qua script');
    console.log('📝 Cần chạy SQL thủ công trong Supabase SQL Editor:');
    console.log('```sql');
    console.log(functionSQL);
    console.log('```');
    
    // 2. Tạo trigger
    console.log('\n⚡ Tạo trigger on_auth_user_created...');
    const triggerSQL = `
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_new_user();
    `;
    
    console.log('📝 SQL để tạo trigger:');
    console.log('```sql');
    console.log(triggerSQL);
    console.log('```');
    
    // 3. Test trigger bằng cách tạo user mới
    console.log('\n🧪 Test trigger với user mới...');
    const testEmail = `test-trigger-${Date.now()}@cineverse.local`;
    
    console.log('📝 Đang tạo user test:', testEmail);
    
    // Tạo user test
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'Test123456!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Test Trigger User',
        username: `test_trigger_${Date.now()}`
      }
    });
    
    if (authError) {
      console.log('❌ Lỗi tạo user test:', authError.message);
      return;
    }
    
    console.log('✅ Đã tạo user test:', authData.user?.id);
    
    // Đợi trigger chạy
    console.log('⏳ Đợi 3 giây để trigger chạy...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Kiểm tra profile được tạo tự động
    console.log('🔍 Kiểm tra profile được tạo tự động...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user?.id)
      .single();
    
    if (profileError) {
      console.log('❌ Profile không được tạo tự động:', profileError.message);
      console.log('🔍 Trigger có thể chưa được thiết lập');
      console.log('📝 Vui lòng chạy SQL script trong Supabase SQL Editor');
    } else {
      console.log('🎉 SUCCESS! Trigger hoạt động - Profile được tạo tự động:');
      console.log({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        username: profile.username,
        role: profile.role,
        verify: profile.verify
      });
    }
    
    // Dọn dẹp
    console.log('\n🗑️ Dọn dẹp test user...');
    await supabase.auth.admin.deleteUser(authData.user?.id);
    
    if (profile) {
      await supabase
        .from('profiles')
        .delete()
        .eq('id', authData.user?.id);
    }
    
    console.log('✅ Đã dọn dẹp hoàn tất');
    
  } catch (error) {
    console.error('❌ Lỗi tạo trigger:', error);
  }
}

createAutoProfileTrigger();
