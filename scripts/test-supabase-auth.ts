import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'http://127.0.0.1:54321',
  'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'
);

async function checkUser() {
  console.log('Testing Supabase Auth...');
  
  // Test sign up first
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: 'test@cineverse.com',
    password: 'testpassword123',
  });

  if (signUpError) {
    console.log('Sign up error (user may already exist):', signUpError.message);
  } else {
    console.log('Sign up success:', signUpData);
  }

  // Test sign in with the newly created user
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'test@cineverse.com',
    password: 'testpassword123',
  });

  if (signInError) {
    console.error('Sign in error:', signInError.message);
    return;
  }

  console.log('Sign in success:', signInData);

  // Test get user
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.error('Get user error:', userError.message);
    return;
  }

  console.log('User info:', userData.user);

  // Test profiles table
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userData.user?.id)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    console.error('Profile error:', profileError.message);
  } else if (profileData) {
    console.log('Profile data:', profileData);
  } else {
    // Create profile if it doesn't exist
    console.log('Profile not found, creating...');
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: userData.user?.id,
        username: 'testuser'
      })
      .select()
      .single();

    if (createError) {
      console.error('Create profile error:', createError.message);
    } else {
      console.log('Created profile:', newProfile);
    }
  }

  // Test sign out
  const { error: signOutError } = await supabase.auth.signOut();
  if (signOutError) {
    console.error('Sign out error:', signOutError.message);
  } else {
    console.log('Sign out success');
  }
}

checkUser().catch(console.error);
