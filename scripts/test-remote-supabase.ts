import { createClient } from '@supabase/supabase-js';

// Sử dụng keys từ .env.local (remote Supabase)
const supabase = createClient(
  'https://exsoflgvdreikabvhvkg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c29mbGd2ZHJlaWthYnZodmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzg0NzYsImV4cCI6MjA3MzYxNDQ3Nn0.80qGLi5hEqLAHyY3-0eDgvxWf70oj7z7SimSA9V_ZUM'
);

async function testRemoteSupabase() {
  console.log('Testing Remote Supabase with .env.local keys...');
  
  // Test sign up
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: 'remotetest@cineverse.com',
    password: 'remotetest123',
  });

  if (signUpError) {
    console.log('Sign up error (user may already exist):', signUpError.message);
  } else {
    console.log('Sign up success:', signUpData.user?.email);
  }

  // Test sign in
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'remotetest@cineverse.com',
    password: 'remotetest123',
  });

  if (signInError) {
    console.error('Sign in error:', signInError.message);
    return;
  }

  console.log('✅ Sign in success:', signInData.user?.email);
  console.log('🆔 User ID:', signInData.user?.id);

  // Test profiles table
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', signInData.user?.id)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    console.error('Profile error:', profileError.message);
  } else if (profileData) {
    console.log('📋 Profile exists:', profileData);
  } else {
    // Create profile
    console.log('📝 Creating profile...');
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: signInData.user?.id,
        username: 'remotetestuser'
      })
      .select()
      .single();

    if (createError) {
      console.error('Create profile error:', createError.message);
    } else {
      console.log('✅ Created profile:', newProfile);
    }
  }

  // Test watchlist
  console.log('🎬 Testing watchlist...');
  const { data: watchlistData, error: watchlistError } = await supabase
    .from('watchlist')
    .insert({
      user_id: signInData.user?.id,
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
    console.error('Watchlist error:', watchlistError.message);
  } else {
    console.log('✅ Added to watchlist:', watchlistData.title);
  }

  // Test histories
  console.log('📚 Testing histories...');
  const { data: historyData, error: historyError } = await supabase
    .from('histories')
    .insert({
      user_id: signInData.user?.id,
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
    console.error('History error:', historyError.message);
  } else {
    console.log('✅ Added to history:', historyData.title);
  }

  // Read all data
  console.log('📖 Reading user data...');
  const { data: userWatchlist } = await supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', signInData.user?.id);

  const { data: userHistories } = await supabase
    .from('histories')
    .select('*')
    .eq('user_id', signInData.user?.id)
    .order('updated_at', { ascending: false });

  console.log('🎬 User watchlist:', userWatchlist?.length || 0, 'items');
  console.log('📚 User histories:', userHistories?.length || 0, 'items');

  // Sign out
  await supabase.auth.signOut();
  console.log('✅ Test completed successfully!');
}

testRemoteSupabase().catch(console.error);
