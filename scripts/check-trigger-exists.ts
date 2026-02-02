import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exsoflgvdreikabvhvkg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c29mbGd2ZHJlaWthYnZodmtnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAzODQ3NiwiZXhwIjoyMDczNjE0NDc2fQ.GzCb1r9W2Y9G1QidElkxsTB6WKZ7KPH2HKB39nolbkY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTriggerExists() {
  console.log('🔍 Kiểm tra trigger và function đã được tạo...');
  
  try {
    // Kiểm tra trigger
    console.log('\n📋 Kiểm tra trigger...');
    const { data: triggers, error: triggerError } = await supabase
      .from('information_schema.triggers')
      .select('trigger_name, event_manipulation, event_object_table, action_timing')
      .eq('trigger_name', 'on_auth_user_created');
    
    if (triggerError) {
      console.log('❌ Lỗi kiểm tra trigger:', triggerError.message);
    } else {
      console.log('✅ Triggers tìm thấy:', triggers?.length || 0);
      if (triggers && triggers.length > 0) {
        triggers.forEach(t => {
          console.log(`  🎯 ${t.trigger_name}:`);
          console.log(`     - Event: ${t.event_manipulation}`);
          console.log(`     - Table: ${t.event_object_table}`);
          console.log(`     - Timing: ${t.action_timing}`);
        });
      } else {
        console.log('❌ Trigger on_auth_user_created không tồn tại');
      }
    }
    
    // Kiểm tra function
    console.log('\n🔧 Kiểm tra function...');
    const { data: functions, error: functionError } = await supabase
      .from('information_schema.routines')
      .select('routine_name, routine_type, external_language')
      .eq('routine_name', 'handle_new_user');
    
    if (functionError) {
      console.log('❌ Lỗi kiểm tra function:', functionError.message);
    } else {
      console.log('✅ Functions tìm thấy:', functions?.length || 0);
      if (functions && functions.length > 0) {
        functions.forEach(f => {
          console.log(`  ⚙️ ${f.routine_name}:`);
          console.log(`     - Type: ${f.routine_type}`);
          console.log(`     - Language: ${f.external_language}`);
        });
      } else {
        console.log('❌ Function handle_new_user không tồn tại');
      }
    }
    
    // Kiểm tra profiles table structure
    console.log('\n📊 Kiểm tra profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Lỗi truy vấn profiles:', profilesError.message);
    } else {
      console.log('✅ Profiles table có thể truy cập');
      if (profiles && profiles.length > 0) {
        console.log('📋 Sample profile data:');
        console.log(`  - ID: ${profiles[0].id}`);
        console.log(`  - Email: ${profiles[0].email}`);
        console.log(`  - Full Name: ${profiles[0].full_name}`);
        console.log(`  - Username: ${profiles[0].username || 'NULL'}`);
        console.log(`  - Role: ${profiles[0].role}`);
        console.log(`  - Verify: ${profiles[0].verify}`);
      }
    }
    
    // Kiểm tra RLS status
    console.log('\n🔒 Kiểm tra RLS status...');
    const { data: rlsStatus, error: rlsError } = await supabase
      .from('pg_tables')
      .select('tablename, rowsecurity')
      .eq('tablename', 'profiles');
    
    if (rlsError) {
      console.log('❌ Lỗi kiểm tra RLS:', rlsError.message);
    } else {
      console.log('✅ RLS status:');
      if (rlsStatus && rlsStatus.length > 0) {
        rlsStatus.forEach(t => {
          console.log(`  🛡️ ${t.tablename}: RLS=${t.rowsecurity ? 'ENABLED' : 'DISABLED'}`);
        });
      }
    }
    
    console.log('\n🎯 Kết luận:');
    if (triggers && triggers.length > 0 && functions && functions.length > 0) {
      console.log('✅ Trigger và function đã được tạo thành công!');
      console.log('🚀 Profile sẽ tự động được tạo khi user đăng ký mới');
    } else {
      console.log('❌ Trigger hoặc function chưa được tạo');
      console.log('📝 Vui lòng chạy lại SQL script trong Supabase SQL Editor');
    }
    
  } catch (error) {
    console.error('❌ Lỗi kiểm tra:', error);
  }
}

checkTriggerExists();
