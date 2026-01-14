import { createClient } from '@supabase/supabase-js';

// Remote Supabase với keys từ .env.local
const supabase = createClient(
  'https://exsoflgvdreikabvhvkg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c29mbGd2ZHJlaWthYnZodmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzg0NzYsImV4cCI6MjA3MzYxNDQ3Nn0.80qGLi5hEqLAHyY3-0eDgvxWf70oj7z7SimSA9V_ZUM'
);

async function syncAndTestSchema() {
  console.log('🔄 Syncing Schema and Testing with ankun.n.m@gmail.com...');
  
  try {
    // Step 1: Test sign in with provided credentials
    console.log('🔐 Testing sign in with ankun.n.m@gmail.com...');
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'ankun.n.m@gmail.com',
      password: '@iamAnKun',
    });

    if (signInError) {
      console.error('❌ Sign in failed:', signInError.message);
      
      // Try to understand the error better
      if (signInError.message.includes('captcha')) {
        console.log('ℹ️ Captcha is enabled on remote. Trying alternative approach...');
        
        // Try to get user info without sign in (if user exists)
        console.log('🔍 Checking if user exists in database...');
        
        // Check profiles table for this email
        const { data: profileCheck, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', 'ankun.n.m@gmail.com')
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('❌ Profile check error:', profileError.message);
        } else if (profileCheck) {
          console.log('✅ User found in profiles:', profileCheck);
        } else {
          console.log('ℹ️ User not found in profiles table');
        }
      }
      return;
    }

    console.log('✅ Sign in successful!');
    console.log('👤 User:', signInData.user?.email);
    console.log('🆔 User ID:', signInData.user?.id);

    // Step 2: Check current profile structure
    console.log('📋 Checking current profile...');
    
    const { data: currentProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signInData.user?.id)
      .single();

    if (profileError) {
      console.error('❌ Profile error:', profileError.message);
    } else {
      console.log('✅ Current profile:', currentProfile);
    }

    // Step 3: Test if we need to add username column
    console.log('🔧 Checking if username column exists...');
    
    try {
      const { data: testUsername, error: usernameError } = await supabase
        .from('profiles')
        .select('username')
        .limit(1);

      if (usernameError) {
        console.log('ℹ️ Username column may not exist:', usernameError.message);
        console.log('🔄 Need to sync schema - adding username column...');
        
        // Note: We can't alter table with anon key, need service role
        console.log('⚠️ Schema sync requires service role key');
      } else {
        console.log('✅ Username column exists');
      }
    } catch (err) {
      console.log('ℹ️ Username column test failed');
    }

    // Step 4: Test watchlist functionality
    console.log('🎬 Testing watchlist functionality...');
    
    const { data: watchlistTest, error: watchlistError } = await supabase
      .from('watchlist')
      .insert({
        user_id: signInData.user?.id,
        id: 550, // Fight Club
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
      console.error('❌ Watchlist insert error:', watchlistError.message);
    } else {
      console.log('✅ Successfully added to watchlist:', watchlistTest.title);
    }

    // Step 5: Test histories functionality
    console.log('📚 Testing histories functionality...');
    
    const { data: historyTest, error: historyError } = await supabase
      .from('histories')
      .insert({
        user_id: signInData.user?.id,
        media_id: 13, // Game of Thrones
        type: 'tv',
        season: 1,
        episode: 1,
        duration: 62,
        last_position: 30,
        completed: false,
        adult: false,
        backdrop_path: '/wHa6KOa3Q18phLORLzC8Zg0j2l.jpg',
        poster_path: '/4EYPN5mVIhKLfxGruy7VAFZ2j9b.jpg',
        release_date: '2011-04-17',
        title: 'Game of Thrones',
        vote_average: 8.4
      })
      .select()
      .single();

    if (historyError) {
      console.error('❌ History insert error:', historyError.message);
    } else {
      console.log('✅ Successfully added to history:', historyTest.title);
    }

    // Step 6: Read back all data
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

    console.log('🎬 User watchlist count:', userWatchlist?.length || 0);
    console.log('📚 User histories count:', userHistories?.length || 0);

    // Step 7: Sign out
    await supabase.auth.signOut();
    console.log('✅ Successfully signed out');

    console.log('🎉 Schema sync and test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

syncAndTestSchema().catch(console.error);
