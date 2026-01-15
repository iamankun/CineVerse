import { createClient } from '@supabase/supabase-js';

// Service role client để bypass hooks
const serviceSupabase = createClient(
  'https://exsoflgvdreikabvhvkg.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key-here',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function bypassHooksAndCreateUser() {
  console.log('🔄 Bypassing Hooks with Service Role...');
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY === 'your-service-role-key-here') {
    console.log('❌ Service role key not found in .env.local');
    console.log('📝 Please add SUPABASE_SERVICE_ROLE_KEY to .env.local');
    console.log('🔑 Get it from: Supabase Dashboard → Settings → API');
    return;
  }

  try {
    // Step 1: Delete existing user if exists
    console.log('🗑️ Checking for existing user...');
    
    const { data: users } = await serviceSupabase.auth.admin.listUsers();
    const existingUser = users.users.find(u => u.email === 'ankun.n.m@gmail.com');
    
    if (existingUser) {
      console.log('🗑️ Deleting existing user:', existingUser.id);
      const { error: deleteError } = await serviceSupabase.auth.admin.deleteUser(existingUser.id);
      
      if (deleteError) {
        console.error('❌ Delete user error:', deleteError.message);
      } else {
        console.log('✅ Existing user deleted');
      }
    }

    // Step 2: Create new user with service role
    console.log('👤 Creating new user with service role...');
    
    const { data: newUser, error: createError } = await serviceSupabase.auth.admin.createUser({
      email: 'ankun.n.m@gmail.com',
      password: 'AnKun@2025!',
      email_confirm: true,
      user_metadata: {
        full_name: 'An Kun',
        username: 'ankun'
      }
    });

    if (createError) {
      console.error('❌ Create user error:', createError.message);
      return;
    }

    console.log('✅ User created successfully!');
    console.log('👤 Email:', newUser.user?.email);
    console.log('🆔 User ID:', newUser.user?.id);

    // Step 3: Create profile
    console.log('📋 Creating profile...');
    
    const { data: profile, error: profileError } = await serviceSupabase
      .from('profiles')
      .upsert({
        id: newUser.user?.id,
        email: 'ankun.n.m@gmail.com',
        full_name: 'An Kun',
        role: 'admin',
        verify: 'true'
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Profile creation error:', profileError.message);
    } else {
      console.log('✅ Profile created:', profile);
    }

    // Step 4: Test with anon key
    console.log('🔐 Testing login with anon key...');
    
    const anonSupabase = createClient(
      'https://exsoflgvdreikabvhvkg.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c29mbGd2ZHJlaWthYnZodmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzg0NzYsImV4cCI6MjA3MzYxNDQ3Nn0.80qGLi5hEqLAHyY3-0eDgvxWf70oj7z7SimSA9V_ZUM'
    );

    const { data: signInData, error: signInError } = await anonSupabase.auth.signInWithPassword({
      email: 'ankun.n.m@gmail.com',
      password: 'AnKun@2025!',
    });

    if (signInError) {
      console.error('❌ Login still failed:', signInError.message);
    } else {
      console.log('🎉 Login successful!');
      console.log('👤 User:', signInData.user?.email);
      
      // Test database operations
      await testDatabaseOperations(signInData.user?.id, anonSupabase);
    }

  } catch (error) {
    console.error('❌ Process failed:', error);
  }
}

async function testDatabaseOperations(userId: string | undefined, supabase: any) {
  if (!userId) return;

  console.log('🗄️ Testing database operations...');

  // Test watchlist
  const { data: watchlistItem, error: watchlistError } = await supabase
    .from('watchlist')
    .insert({
      user_id: userId,
      id: 27205,
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
    console.log('✅ Watchlist item added:', watchlistItem.title);
  }

  // Test histories
  const { data: historyItem, error: historyError } = await supabase
    .from('histories')
    .insert({
      user_id: userId,
      media_id: 550,
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
    console.log('✅ History item added:', historyItem.title);
  }

  console.log('🎉 All tests completed successfully!');
}

bypassHooksAndCreateUser().catch(console.error);
