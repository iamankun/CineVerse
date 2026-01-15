import { createClient } from '@supabase/supabase-js';

// Remote Supabase với anon key
const supabase = createClient(
  'https://exsoflgvdreikabvhvkg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c29mbGd2ZHJlaWthYnZodmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzg0NzYsImV4cCI6MjA3MzYxNDQ3Nn0.80qGLi5hEqLAHyY3-0eDgvxWf70oj7z7SimSA9V_ZUM'
);

async function testUserCreationAndLogin() {
  console.log('🔄 Testing User Creation and Login...');
  
  try {
    // Step 1: Check current schema
    console.log('🔍 Checking current profiles schema...');
    
    const { data: schemaCheck, error: schemaError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (schemaError) {
      console.error('❌ Schema check error:', schemaError.message);
    } else {
      console.log('✅ Current schema columns:', schemaCheck.length > 0 ? Object.keys(schemaCheck[0]) : 'Table is empty');
      
      // Check if username column exists
      if (schemaCheck.length > 0 && schemaCheck[0].username !== undefined) {
        console.log('✅ Username column exists');
      } else {
        console.log('ℹ️ Username column may not exist, but we can still work with email');
      }
    }

    // Step 2: Try to create user through signup (bypass captcha if possible)
    console.log('👤 Attempting to create user ankun.n.m@gmail.com...');
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'ankun.n.m@gmail.com',
      password: '@iamAnKun',
      options: {
        data: {
          full_name: 'An Kun',
          username: 'ankun'
        }
      }
    });

    if (signUpError) {
      console.log('ℹ️ Sign up failed (expected due to captcha):', signUpError.message);
      
      // Try alternative approach - check if user exists in auth
      console.log('🔍 Checking if user already exists...');
      
      // We can't directly check auth users with anon key, so let's try to sign in
      const { data: signInAttempt, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'ankun.n.m@gmail.com',
        password: '@iamAnKun',
      });

      if (signInError) {
        console.log('❌ User does not exist or wrong password:', signInError.message);
        console.log('💡 User needs to be created manually in Supabase Dashboard or with service role');
        return;
      } else {
        console.log('✅ User exists and sign in successful!');
        console.log('👤 User:', signInAttempt.user?.email);
        console.log('🆔 User ID:', signInAttempt.user?.id);
        
        // Test profile creation/update
        await testProfileOperations(signInAttempt.user?.id);
      }
    } else {
      console.log('✅ User created successfully!');
      console.log('👤 User:', signUpData.user?.email);
      console.log('🆔 User ID:', signUpData.user?.id);
      
      // Test profile creation/update
      await testProfileOperations(signUpData.user?.id);
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
    
    // Create profile
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: 'ankun.n.m@gmail.com',
        full_name: 'An Kun',
        username: 'ankun',
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

testUserCreationAndLogin().catch(console.error);
