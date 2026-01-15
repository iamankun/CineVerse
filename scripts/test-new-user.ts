import { createClient } from '@supabase/supabase-js';

// Test với user khác để xác định vấn đề
const supabase = createClient(
  'https://exsoflgvdreikabvhvkg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c29mbGd2ZHJlaWthYnZodmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzg0NzYsImV4cCI6MjA3MzYxNDQ3Nn0.80qGLi5hEqLAHyY3-0eDgvxWf70oj7z7SimSA9V_ZUM'
);

async function testWithNewUser() {
  console.log('🔄 Testing with Completely New User...');
  
  try {
    // Tạo user hoàn toàn mới
    const newEmail = `test${Date.now()}@cineverse.com`;
    const newPassword = 'TestUser@2025!';
    
    console.log('👤 Creating new user:', newEmail);
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: newEmail,
      password: newPassword,
      options: {
        data: {
          full_name: 'Test User',
          username: `testuser${Date.now()}`
        }
      }
    });

    if (signUpError) {
      console.error('❌ Sign up error:', signUpError.message);
      return;
    }

    console.log('✅ User created successfully!');
    console.log('👤 Email:', signUpData.user?.email);
    console.log('🆔 User ID:', signUpData.user?.id);

    // Test sign in ngay lập tức
    console.log('🔐 Testing immediate sign in...');
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: newEmail,
      password: newPassword,
    });

    if (signInError) {
      console.error('❌ Sign in error:', signInError.message);
      
      // Nếu lỗi 405, vấn đề là system-wide
      if (signInError.message.includes('405')) {
        console.log('🚨 Lỗi 405 là system-wide, không phải user-specific');
        console.log('🔧 Có thể do:');
        console.log('   - Database trigger');
        console.log('   - Custom RLS policy');
        console.log('   - Supabase system issue');
      }
    } else {
      console.log('✅ Sign in successful!');
      console.log('👤 User:', signInData.user?.email);
      
      // Test database operations
      await testDatabaseOperations(signInData.user?.id);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function testDatabaseOperations(userId: string | undefined) {
  if (!userId) return;

  console.log('🗄️ Testing database operations...');

  // Test profiles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email: 'test@cineverse.com',
      full_name: 'Test User',
      role: 'member',
      verify: 'true'
    })
    .select()
    .single();

  if (profileError) {
    console.error('❌ Profile error:', profileError.message);
  } else {
    console.log('✅ Profile created:', profile.full_name);
  }

  // Test watchlist
  const { data: watchlistItem, error: watchlistError } = await supabase
    .from('watchlist')
    .insert({
      user_id: userId,
      id: 550,
      type: 'movie',
      adult: false,
      backdrop_path: '/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
      poster_path: '/nn7PzhNtM8mQyvR2IIJHb2jgJlJ.jpg',
      release_date: '1999-10-15',
      title: 'Fight Club',
      vote_average: 8.8
    })
    .select()
    .single();

  if (watchlistError) {
    console.error('❌ Watchlist error:', watchlistError.message);
  } else {
    console.log('✅ Watchlist item added:', watchlistItem.title);
  }

  console.log('🎉 Test completed!');
}

testWithNewUser().catch(console.error);
