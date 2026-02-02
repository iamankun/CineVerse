import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exsoflgvdreikabvhvkg.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c29mbGd2ZHJlaWthYnZodmtnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAzODQ3NiwiZXhwIjoyMDczNjE0NDc2fQ.GzCb1r9W2Y9G1QidElkxsTB6WKZ7KPH2HKB39nolbkY';

const supabase = createClient(supabaseUrl, serviceKey);

async function grantAdminAccess() {
  console.log('🔧 Cấp quyền admin cho tài khoản...');
  
  try {
    // 1. Tìm user ankun.n.m@gmail.com
    console.log('\n📧 Tìm user ankun.n.m@gmail.com...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Lỗi lấy danh sách users:', authError.message);
      return;
    }
    
    const targetUser = authUsers.users.find(u => u.email === 'ankun.n.m@gmail.com');
    
    if (!targetUser) {
      console.log('❌ Không tìm thấy user ankun.n.m@gmail.com');
      console.log('📋 Danh sách users:');
      authUsers.users.forEach(u => {
        console.log(`  - ${u.email} (${u.id})`);
      });
      return;
    }
    
    console.log('✅ Tìm thấy user:', {
      id: targetUser.id,
      email: targetUser.email,
      created_at: targetUser.created_at
    });
    
    // 2. Kiểm tra profile hiện tại
    console.log('\n📋 Kiểm tra profile hiện tại...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetUser.id)
      .single();
    
    if (profileError) {
      console.log('❌ Lỗi fetch profile:', profileError.message);
      
      // Tạo profile nếu chưa có
      if (profileError.message?.includes('No rows returned')) {
        console.log('🔧 Tạo profile mới cho user...');
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: targetUser.id,
            email: targetUser.email,
            full_name: 'An Kun',
            username: 'ankun',
            role: 'admin',
            verify: 'true'
          })
          .select()
          .single();
        
        if (createError) {
          console.log('❌ Lỗi tạo profile:', createError.message);
        } else {
          console.log('✅ Đã tạo profile admin:', newProfile);
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
    
    // 3. Cập nhật role thành admin
    console.log('\n👑 Cập nhật role thành admin...');
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        role: 'admin',
        verify: 'true'
      })
      .eq('id', targetUser.id)
      .select()
      .single();
    
    if (updateError) {
      console.log('❌ Lỗi cập nhật profile:', updateError.message);
    } else {
      console.log('✅ Đã cập nhật profile thành admin:', updatedProfile);
    }
    
    // 4. Cập nhật user metadata
    console.log('\n🔐 Cập nhật user metadata...');
    const { error: metadataError } = await supabase.auth.admin.updateUserById(
      targetUser.id,
      {
        user_metadata: {
          role: 'admin',
          full_name: 'An Kun',
          username: 'ankun'
        }
      }
    );
    
    if (metadataError) {
      console.log('❌ Lỗi cập nhật metadata:', metadataError.message);
    } else {
      console.log('✅ Đã cập nhật user metadata');
    }
    
    // 5. Kiểm tra lại kết quả
    console.log('\n🔍 Kiểm tra lại kết quả...');
    const { data: finalProfile, error: finalError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetUser.id)
      .single();
    
    if (finalError) {
      console.log('❌ Lỗi kiểm tra cuối cùng:', finalError.message);
    } else {
      console.log('✅ Kết quả cuối cùng:', {
        id: finalProfile.id,
        email: finalProfile.email,
        full_name: finalProfile.full_name,
        username: finalProfile.username,
        role: finalProfile.role,
        verify: finalProfile.verify
      });
    }
    
    console.log('\n🎉 Hoàn tất! ankun.n.m@gmail.com đã được cấp quyền admin');
    console.log('📝 Giờ có thể truy cập /admin mà không cần đăng nhập lại');
    
  } catch (error) {
    console.error('❌ Lỗi cấp quyền admin:', error);
  }
}

grantAdminAccess();
