import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exsoflgvdreikabvhvkg.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c29mbGd2ZHJlaWthYnZodmtnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAzODQ3NiwiZXhwIjoyMDczNjE0NDc2fQ.GzCb1r9W2Y9G1QidElkxsTB6WKZ7KPH2HKB39nolbkY';

const supabase = createClient(supabaseUrl, serviceKey);

async function debugAdminAccess() {
  console.log('🔍 Debug admin access issues...');
  
  try {
    // 1. Kiểm tra user hiện tại
    console.log('\n👤 Kiểm tra user hiện tại...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('❌ Lỗi getUser:', userError.message);
      return;
    }
    
    if (!user) {
      console.log('❌ Không có user login');
      return;
    }
    
    console.log('✅ User hiện tại:', {
      id: user.id,
      email: user.email,
      created_at: user.created_at
    });
    
    // 2. Kiểm tra profile
    console.log('\n📋 Kiểm tra profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.log('❌ Lỗi fetch profile:', profileError.message);
      console.log('🔍 Chi tiết lỗi:', {
        code: profileError.code,
        details: profileError.details,
        hint: profileError.hint
      });
      
      if (profileError.message?.includes('No rows returned')) {
        console.log('💡 User chưa có profile - cần tạo profile');
        
        // Tạo profile
        console.log('🔧 Tạo profile cho user...');
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || 'User',
            username: user.user_metadata?.username || user.email?.split('@')[0],
            role: 'member',
            verify: 'true'
          })
          .select()
          .single();
        
        if (createError) {
          console.log('❌ Lỗi tạo profile:', createError.message);
        } else {
          console.log('✅ Đã tạo profile:', newProfile);
        }
      }
    } else {
      console.log('✅ Profile hiện tại:', {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        username: profile.username,
        role: profile.role,
        verify: profile.verify
      });
    }
    
    // 3. Kiểm tra RLS policies
    console.log('\n🔒 Kiểm tra RLS policies...');
    try {
      const { data: testProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      console.log('✅ RLS test thành công - User có thể truy cập profile của mình');
    } catch (rlsError: any) {
      console.log('❌ RLS Error:', rlsError.message);
      console.log('🔍 RLS có thể chặn truy cập profile');
    }
    
    // 4. Test với client key (mô phỏng admin login)
    console.log('\n🌐 Test với client key...');
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c29mbGd2ZHJlaWthYnZodmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzg0NzYsImV4cCI6MjA3MzYxNDQ3Nn0.80qGLi5hEqLAHyY3-0eDgvxWf70oj7z7SimSA9V_ZUM';
    const clientSupabase = createClient(supabaseUrl, anonKey);
    
    try {
      const { data: clientProfile } = await clientSupabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      console.log('✅ Client key test thành công:', clientProfile);
    } catch (clientError: any) {
      console.log('❌ Client key error:', clientError.message);
      console.log('🔍 Client side có thể bị RLS chặn');
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugAdminAccess();
