import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exsoflgvdreikabvhvkg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c29mbGd2ZHJlaWthYnZodmtnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAzODQ3NiwiZXhwIjoyMDczNjE0NDc2fQ.GzCb1r9W2Y9G1QidElkxsTB6WKZ7KPH2HKB39nolbkY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createProfileTrigger() {
  console.log('🔧 Tạo trigger tự động tạo profile khi user đăng ký...');
  
  try {
    // Tạo function để tự động tạo profile
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
          INSERT INTO public.profiles (id, email, full_name, username, role, verify)
          VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
            COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
            'member',
            'false'
          );
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });
    
    if (functionError) {
      console.log('❌ Lỗi tạo function:', functionError.message);
    } else {
      console.log('✅ Đã tạo function handle_new_user');
    }
    
    // Tạo trigger
    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW
          EXECUTE FUNCTION public.handle_new_user();
      `
    });
    
    if (triggerError) {
      console.log('❌ Lỗi tạo trigger:', triggerError.message);
    } else {
      console.log('✅ Đã tạo trigger on_auth_user_created');
    }
    
    // Test trigger
    console.log('\n🧪 Test trigger với user mới...');
    const { data: testUser, error: testError } = await supabase.auth.admin.createUser({
      email: 'test-trigger@cineverse.local',
      password: 'Test123456!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Test Trigger User',
        username: 'test_trigger_user'
      }
    });
    
    if (testError) {
      console.log('❌ Lỗi tạo test user:', testError.message);
    } else {
      console.log('✅ Đã tạo test user:', testUser.user?.id);
      
      // Kiểm tra profile được tạo tự động
      setTimeout(async () => {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', testUser.user?.id)
          .single();
        
        if (profileError) {
          console.log('❌ Profile không được tạo tự động:', profileError.message);
        } else {
          console.log('✅ Profile được tạo tự động:', {
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            username: profile.username,
            role: profile.role
          });
        }
        
        // Xóa test user
        await supabase.auth.admin.deleteUser(testUser.user?.id);
        console.log('🗑️ Đã xóa test user');
      }, 2000);
    }
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
}

createProfileTrigger();
