import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exsoflgvdreikabvhvkg.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c29mbGd2ZHJlaWthYnZodmtnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAzODQ3NiwiZXhwIjoyMDczNjE0NDc6fQ.GzCb1r9W2Y9G1QidElkxsTB6WKZ7KPH2HKB39nolbkY';

const supabase = createClient(supabaseUrl, serviceKey);

async function testDirectProfileUpdate() {
  console.log('🧪 Kiểm tra trực tiếp cập nhật profile với service key...');
  
  try {
    // 1. Lấy một profile để test
    console.log('📋 Lấy profile để test...');
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (fetchError) {
      console.log('❌ Lỗi fetch profiles:', fetchError.message);
      return;
    }
    
    if (!profiles || profiles.length === 0) {
      console.log('❌ Không có profile nào để test');
      return;
    }
    
    const testProfile = profiles[0];
    console.log('✅ Profile test:', {
      id: testProfile.id,
      email: testProfile.email,
      full_name: testProfile.full_name,
      username: testProfile.username
    });
    
    // 2. Test cập nhật với service key
    console.log('\n✏️ Test cập nhật với service key...');
    const updateData = {
      username: 'service_test_' + Date.now(),
      full_name: 'Service Test Update',
      bio: 'Updated via service key',
      website: 'https://service-test.com',
      location: 'Service Test Location'
    };
    
    console.log('📝 Dữ liệu cập nhật:', updateData);
    
    const { data: updateResult, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', testProfile.id)
      .select()
      .single();
    
    if (updateError) {
      console.log('❌ Lỗi cập nhật với service key:', updateError.message);
      console.log('🔍 Chi tiết lỗi:', {
        code: updateError.code,
        details: updateError.details,
        hint: updateError.hint
      });
      return;
    }
    
    console.log('✅ Cập nhật thành công với service key:', updateResult);
    
    // 3. Test với client key (anon key) để mô phỏng user
    console.log('\n🔍 Test với client key (mô phỏng user)...');
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c29mbGd2ZHJlaWthYnZodmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzg0NzYsImV4cCI6MjA3MzYxNDQ3Nn0.80qGLi5hEqLAHyY3-0eDgvxWf70oj7z7SimSA9V_ZUM';
    const clientSupabase = createClient(supabaseUrl, anonKey);
    
    const clientUpdateData = {
      username: 'client_test_' + Date.now(),
      full_name: 'Client Test Update',
      bio: 'Updated via client key'
    };
    
    console.log('📝 Dữ liệu client update:', clientUpdateData);
    
    const { data: clientResult, error: clientError } = await clientSupabase
      .from('profiles')
      .update(clientUpdateData)
      .eq('id', testProfile.id)
      .select();
    
    if (clientError) {
      console.log('❌ Lỗi cập nhật với client key:', clientError.message);
      console.log('🔍 Chi tiết lỗi:', {
        code: clientError.code,
        details: clientError.details,
        hint: clientError.hint
      });
      
      if (clientError.message?.includes('row-level security')) {
        console.log('🔒 Đây là lỗi RLS - Client key không có quyền cập nhật');
        console.log('📝 Cần kiểm tra RLS policies cho client');
      }
    } else {
      console.log('✅ Cập nhật thành công với client key:', clientResult);
    }
    
    // 4. Kiểm tra lại dữ liệu cuối cùng
    console.log('\n🔍 Kiểm tra dữ liệu cuối cùng...');
    const { data: finalProfile, error: finalError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', testProfile.id)
      .single();
    
    if (finalError) {
      console.log('❌ Lỗi fetch final:', finalError.message);
    } else {
      console.log('✅ Dữ liệu cuối cùng:', {
        id: finalProfile.id,
        username: finalProfile.username,
        full_name: finalProfile.full_name,
        bio: finalProfile.bio,
        website: finalProfile.website,
        location: finalProfile.location
      });
    }
    
    console.log('\n🎯 Kết luận:');
    console.log('✅ Service key update: ' + (updateResult ? 'Thành công' : 'Thất bại'));
    console.log('🔒 Client key update: ' + (clientResult ? 'Thành công' : 'Thất bại (RLS)'));
    
  } catch (error) {
    console.error('❌ Lỗi test:', error);
  }
}

testDirectProfileUpdate();
