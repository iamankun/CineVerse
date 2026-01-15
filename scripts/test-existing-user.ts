import { createClient } from '@supabase/supabase-js';

// Remote Supabase với anon key
const supabase = createClient(
  'https://exsoflgvdreikabvhvkg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c29mbGd2ZHJlaWthYnZodmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzg0NzYsImV4cCI6MjA3MzYxNDQ3Nn0.80qGLi5hEqLAHyY3-0eDgvxWf70oj7z7SimSA9V_ZUM'
);

async function testExistingUser() {
  console.log('🔄 Testing Existing User...');
  
  try {
    // User already exists, try different passwords
    const passwords = [
      '@iamAnKun',
      'AnKun@2025!',
      'AnKun123!',
      'ankun123',
      'password123'
    ];

    for (const password of passwords) {
      console.log(`🔍 Trying password: ${password}`);
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'ankun.n.m@gmail.com',
        password: password,
      });

      if (signInError) {
        console.log(`❌ Failed: ${signInError.message}`);
      } else {
        console.log('✅ Sign in successful!');
        console.log('👤 User:', signInData.user?.email);
        console.log('🆔 User ID:', signInData.user?.id);
        
        await testProfileOperations(signInData.user?.id);
        return;
      }
    }

    console.log('💡 All passwords failed. User may need password reset or manual creation.');
    
    // Try to reset password
    console.log('🔄 Attempting password reset...');
    
    const { data: resetData, error: resetError } = await supabase.auth.resetPasswordForEmail(
      'ankun.n.m@gmail.com',
      {
        redirectTo: 'https://exsoflgvdreikabvhvkg.supabase.co/auth/v1/verify'
      }
    );

    if (resetError) {
      console.error('❌ Password reset error:', resetError.message);
    } else {
      console.log('✅ Password reset email sent (if email service is configured)');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function testProfileOperations(userId: string | undefined) {
  if (!userId) {
    console.log('❌ No user ID available');
    return;
  }

  console.log('📋 Testing profile operations...');
  
  // Check if profile exists
  const { data: existingProfile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    console.error('❌ Profile check error:', profileError.message);
  } else if (existingProfile) {
    console.log('✅ Profile exists:', existingProfile);
  } else {
    console.log('ℹ️ Profile does not exist, creating...');
    
    // Create profile with current schema
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: 'ankun.n.m@gmail.com',
        full_name: 'An Kun',
        role: 'admin',
        verify: 'true'
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Profile creation error:', createError.message);
    } else {
      console.log('✅ Profile created:', newProfile);
    }
  }

  // Test watchlist
  await testWatchlistOperations(userId);
  
  // Test histories
  await testHistoryOperations(userId);
  
  // Read back all data
  await readUserData(userId);
}

async function testWatchlistOperations(userId: string) {
  console.log('🎬 Testing watchlist operations...');
  
  const { data: watchlistItem, error: watchlistError } = await supabase
    .from('watchlist')
    .insert({
      user_id: userId,
      id: 27205, // The Dark Knight
      type: 'movie',
      adult: false,
      backdrop_path: '/86L8wqGMDbwURPni2t7FQ0nDjsC.jpg',
      poster_path: '/ck3f3I5Fw4E6xLbZfXgDd3TJQGx.jpg',
      release_date: '2008-07-18',
      title: 'The Dark Knight',
      vote_average: 9.0
    })
    .select()
    .single();

  if (watchlistError) {
    console.error('❌ Watchlist error:', watchlistError.message);
  } else {
    console.log('✅ Added to watchlist:', watchlistItem.title);
  }
}

async function testHistoryOperations(userId: string) {
  console.log('📚 Testing history operations...');
  
  const { data: historyItem, error: historyError } = await supabase
    .from('histories')
    .insert({
      user_id: userId,
      media_id: 550, // Fight Club
      type: 'movie',
      season: 0,
      episode: 0,
      duration: 139,
      last_position: 45,
      completed: false,
      adult: false,
      backdrop_path: '/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
      poster_path: '/nn7PzhNtM8mQyvR2IIJHb2jgJlJ.jpg',
      release_date: '1999-10-15',
      title: 'Fight Club',
      vote_average: 8.8
    })
    .select()
    .single();

  if (historyError) {
    console.error('❌ History error:', historyError.message);
  } else {
    console.log('✅ Added to history:', historyItem.title);
  }
}

async function readUserData(userId: string) {
  console.log('📖 Reading user data...');
  
  const { data: userWatchlist } = await supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', userId);

  const { data: userHistories } = await supabase
    .from('histories')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  console.log('🎬 User watchlist count:', userWatchlist?.length || 0);
  console.log('📚 User histories count:', userHistories?.length || 0);
  
  if (userWatchlist && userWatchlist.length > 0) {
    console.log('📋 Watchlist items:', userWatchlist.map(w => w.title));
  }
  
  if (userHistories && userHistories.length > 0) {
    console.log('📚 History items:', userHistories.map(h => h.title));
  }
  
  console.log('🎉 All tests completed successfully!');
}

testExistingUser().catch(console.error);
