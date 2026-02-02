import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exsoflgvdreikabvhvkg.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c29mbGd2ZHJlaWthYnZodmtnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAzODQ3NiwiZXhwIjoyMDczNjE0NDc2fQ.GzCb1r9W2Y9G1QidElkxsTB6WKZ7KPH2HKB39nolbkY';

const supabase = createClient(supabaseUrl, serviceKey);

async function debugSpecificUser() {
  console.log('🔍 Debug chi tiết user ankun.n.m@gmail.com...');
  
  try {
    const userId = 'ec581c6e-1506-4a6d-b120-c2660e9dfabd';
    
    // 1. Kiểm tra tất cả profiles của user này
    console.log('\n📋 Kiểm tra tất cả profiles của user...');
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId);
    
    if (allError) {
      console.log('❌ Lỗi fetch all profiles:', allError.message);
      return;
    }
    
    console.log('✅ Số lượng profiles:', allProfiles?.length || 0);
    
    if (allProfiles && allProfiles.length > 0) {
      allProfiles.forEach((profile, index) => {
        console.log(`📋 Profile ${index + 1}:`, {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          username: profile.username,
          bio: profile.bio,
          website: profile.website,
          location: profile.location,
          avatar_url: profile.avatar_url,
          created_at: profile.created_at,
          updated_at: profile.updated_at
        });
      });
    } else {
      console.log('❌ User không có profile nào - cần tạo profile');
      
      // Tạo profile mới
      console.log('🔧 Tạo profile mới cho user...');
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: 'ankun.n.m@gmail.com',
          full_name: 'An Kun',
          username: 'ankun',
          role: 'member',
          verify: 'true'
        })
        .select();
      
      if (createError) {
        console.log('❌ Lỗi tạo profile:', createError.message);
        console.log('🔍 Details:', {
          code: createError.code,
          details: createError.details,
          hint: createError.hint
        });
      } else {
        console.log('✅ Đã tạo profile mới:', newProfile);
      }
    }
    
    // 2. Kiểm tra duplicate records
    console.log('\n🔍 Kiểm tra duplicate records...');
    const { data: duplicates, error: dupError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', 'ankun.n.m@gmail.com');
    
    if (dupError) {
      console.log('❌ Lỗi kiểm tra duplicates:', dupError.message);
    } else {
      console.log('✅ Duplicate check:', duplicates);
      console.log('📊 Số lượng records:', duplicates?.length || 0);
    }
    
    // 3. Test cập nhật nếu có profile
    if (allProfiles && allProfiles.length > 0) {
      console.log('\n✏️ Test cập nhật profile...');
      const updateData = {
        username: 'ankun_updated_' + Date.now(),
        full_name: 'An Kun Updated',
        bio: 'Updated via debug script',
        website: 'https://ankun.dev',
        location: 'Viet Nam'
      };
      
      const { data: updateResult, error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();
      
      if (updateError) {
        console.log('❌ Lỗi cập nhật:', updateError.message);
        console.log('🔍 Details:', {
          code: updateError.code,
          details: updateError.details,
          hint: updateError.hint
        });
      } else {
        console.log('✅ Cập nhật thành công:', updateResult);
      }
      
      // 4. Kiểm tra lại sau cập nhật
      console.log('\n🔍 Kiểm tra lại sau cập nhật...');
      const { data: finalProfile, error: finalError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (finalError) {
        console.log('❌ Lỗi fetch final:', finalError.message);
      } else {
        console.log('✅ Profile cuối cùng:', finalProfile);
      }
    }
    
  } catch (error) {
    console.error('❌ Lỗi debug:', error);
  }
}

debugSpecificUser();
