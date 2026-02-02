import { createClient } from '@supabase/supabase-js';

// Sử dụng client credentials để test
const supabaseUrl = 'https://exsoflgvdreikabvhvkg.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c29mbGd2ZHJlaWthYnZodmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzg0NzYsImV4cCI6MjA3MzYxNDQ3Nn0.80qGLi5hEqLAHyY3-0eDgvxWf70oj7z7SimSA9V_ZUM';

const supabase = createClient(supabaseUrl, anonKey);

async function testProfileCreation() {
  console.log('🧪 Test tạo profile user mới...');
  
  try {
    // Test signup user mới
    const testEmail = `test-profile-${Date.now()}@cineverse.local`;
    const testPassword = 'Test123456!';
    
    console.log('📝 Đang signup user mới:', testEmail);
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test Profile User',
          username: `test_profile_${Date.now()}`
        }
      }
    });
    
    if (authError) {
      console.log('❌ Lỗi signup:', authError.message);
      return;
    }
    
    console.log('✅ Đã signup user:', authData.user?.id);
    
    // Đợi 3 giây để trigger chạy (nếu có)
    console.log('⏳ Đợi 3 giây để trigger chạy...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Kiểm tra profile với service key
    const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c29mbGd2ZHJlaWthYnZodmtnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAzODQ3NiwiZXhwIjoyMDczNjE0NDc6fQ.GzCb1r9W2Y9G1QidElkxsTB6WKZ7KPH2HKB39nolbkY';
    const serviceSupabase = createClient(supabaseUrl, serviceKey);
    
    console.log('🔍 Kiểm tra profile được tạo...');
    const { data: profile, error: profileError } = await serviceSupabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user?.id)
      .single();
    
    if (profileError) {
      console.log('❌ Profile không được tạo tự động:', profileError.message);
      console.log('🔍 Trigger có thể chưa được thiết lập đúng');
      
      // Tạo profile thủ công cho user này
      console.log('🔧 Tạo profile thủ công cho user test...');
      const { data: manualProfile, error: manualError } = await serviceSupabase
        .from('profiles')
        .insert({
          id: authData.user?.id,
          email: testEmail,
          full_name: 'Test Profile User',
          username: `test_profile_${Date.now()}`,
          role: 'member',
          verify: 'false'
        })
        .select()
        .single();
      
      if (manualError) {
        console.log('❌ Lỗi tạo profile thủ công:', manualError.message);
      } else {
        console.log('✅ Đã tạo profile thủ công:', manualProfile);
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
    
    // Test login và fetch profile
    console.log('\n🔐 Test login và fetch profile...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (loginError) {
      console.log('❌ Lỗi login:', loginError.message);
    } else {
      console.log('✅ Login thành công');
      
      // Fetch profile với client
      const { data: clientProfile, error: clientError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', loginData.user?.id)
        .single();
      
      if (clientError) {
        console.log('❌ Client fetch error:', clientError.message);
      } else {
        console.log('✅ Client fetch thành công:', {
          id: clientProfile.id,
          email: clientProfile.email,
          full_name: clientProfile.full_name
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Lỗi test:', error);
  }
}

testProfileCreation();
