import { createClient } from "@/utils/supabase/client";

// Test Supabase connection
export async function testSupabaseConnection() {
  const supabase = createClient();
  
  console.log('🔑 Kiểm tra Supabase kết nối...');
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('_test_connection').select('*').limit(1);
    console.log('📊 Kiểm tra kết nối:', { data, error });
    
    // Test auth configuration
    const { data: authConfig } = await supabase.auth.getSession();
    console.log('🔐 Xác minh tự động:', authConfig);
    
  } catch (error) {
    console.error('❌ Kiểm tra kết nối thất bại:', error);
  }
}

// Test user creation
export async function createTestUser() {
  const supabase = createClient();
  
  try {
    console.log('👤 Bắt đầu tạo tài khoản...');
    console.log('🔑 Sử dụng URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('🔑 Sử dụng khóa:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
    
    const { data, error } = await supabase.auth.signUp({
      email: 'ankun.n.m@gmail.com',
      password: '@iamAnKun123!', // Contains uppercase, lowercase, numbers, and special chars
      options: {
        emailRedirectTo: 'http://localhost:3000/auth/callback',
        data: {
          username: 'ankunstudio',
          full_name: 'An Kun Studio'
        }
      }
    });
    
    console.log('👤 User creation response:', { data, error });
    
    if (error) {
      console.error('❌ User creation failed:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        code: error.code
      });
      
      // Check if it's a duplicate email error
      if (error.message?.includes('duplicate') || error.message?.includes('already registered')) {
        console.log('ℹ️ User already exists, trying to get user info...');
        const { data: existingUser } = await supabase.auth.getUser();
        console.log('👤 Existing user info:', existingUser);
      }
    } else {
      console.log('✅ Test user created successfully');
      console.log('📧 User ID:', data.user?.id);
      console.log('📧 User Email:', data.user?.email);
      console.log('🔐 Email Confirmed:', !!data.user?.email_confirmed_at);
      console.log('👤 Created At:', data.user?.created_at);
    }
    
  } catch (error: any) {
    console.error('❌ User creation error:', error);
    console.error('Error stack:', error.stack);
  }
}

// Test login with created user
export async function testLogin() {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'ankun.n.m@gmail.com',
      password: '@iamAnKun123!',
    });
    
    console.log('🔐 Test login:', { data, error });
    
    if (error) {
      console.error('❌ Login failed:', error);
      
      // Check user status
      const { data: user } = await supabase.auth.getUser();
      console.log('👤 Current user status:', {
        user: user,
        email_confirmed_at: user?.user?.email_confirmed_at,
        is_confirmed: !!user?.user?.email_confirmed_at
      });
    } else {
      console.log('✅ Test login successful');
      console.log('👤 User session:', data.user);
    }
    
  } catch (error) {
    console.error('❌ Login error:', error);
  }
}

// Delete test user if exists
export async function deleteTestUser() {
  const supabase = createClient();
  
  try {
    console.log('🗑️ Attempting to delete test user...');
    
    // First try to sign in to get the user session
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: 'test@cineverse.local',
      password: 'Test123!@#',
    });
    
    if (signInError) {
      console.log('ℹ️ Cannot sign in to delete user:', signInError.message);
      return { success: false, message: 'Cannot sign in to delete user' };
    }
    
    // Delete the user
    const { error: deleteError } = await supabase.from("profiles").delete().neq("id", "0");
    
    if (deleteError) {
      console.error('❌ Failed to delete user:', deleteError);
      return { success: false, message: deleteError.message };
    }
    
    console.log('✅ Test user deleted successfully');
    return { success: true, message: 'User deleted' };
    
  } catch (error: any) {
    console.error('❌ Delete user error:', error);
    return { success: false, message: error.message };
  }
}

// Check user exists and email verification status
export async function checkUserExists(email: string) {
  const supabase = createClient();
  
  try {
    console.log('🔍 Kiểm tra user tồn tại:', email);
    
    // Try to sign in to check if user exists
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: '@iamAnKun123!', // Try with the test password
    });
    
    if (error) {
      console.log('❌ Login test failed:', error.message);
      
      // Check specific error types
      if (error.message?.includes('Invalid login credentials')) {
        // Try to reset password to see if user exists
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: 'http://localhost:3000/auth/reset-password',
        });
        
        if (resetError?.message?.includes('Email not found')) {
          console.log('❌ User không tồn tại trong hệ thống');
          return { exists: false, message: 'User không tồn tại' };
        } else {
          console.log('✅ User tồn tại nhưng sai password');
          return { exists: true, message: 'User tồn tại nhưng sai password' };
        }
      }
      
      if (error.message?.includes('Email not confirmed')) {
        console.log('⚠️ User tồn tại nhưng email chưa được xác minh');
        return { exists: true, confirmed: false, message: 'Email chưa được xác minh' };
      }
      
      return { exists: false, message: error.message };
    }
    
    // If login successful
    console.log('✅ User tồn tại và login thành công');
    console.log('👤 User info:', {
      id: data.user?.id,
      email: data.user?.email,
      email_confirmed_at: data.user?.email_confirmed_at,
      created_at: data.user?.created_at
    });
    
    return { 
      exists: true, 
      confirmed: !!data.user?.email_confirmed_at,
      message: 'User tồn tại và đã xác minh email',
      user: data.user
    };
    
  } catch (error: any) {
    console.error('❌ Lỗi kiểm tra user:', error);
    return { exists: false, message: error.message };
  }
}
