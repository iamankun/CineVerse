import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkUser() {
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'ankun.n.m@gmail.com',
    password: '@iamAnKun',
  });

  if (signInError) {
    console.error('Sign in error:', signInError);
    return;
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.error('Get user error:', userError);
    return;
  }

  console.log('User info:', userData);
}

checkUser();
