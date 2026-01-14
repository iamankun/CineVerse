import { createClient } from '@supabase/supabase-js';

// Remote Supabase với service role key để sync schema
const serviceSupabase = createClient(
  'https://exsoflgvdreikabvhvkg.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key-here'
);

// Remote Supabase với anon key để test
const anonSupabase = createClient(
  'https://exsoflgvdreikabvhvkg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c29mbGd2ZHJlaWthYnZodmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzg0NzYsImV4cCI6MjA3MzYxNDQ3Nn0.80qGLi5hEqLAHyY3-0eDgvxWf70oj7z7SimSA9V_ZUM'
);

async function syncSchemaAndCreateUser() {
  console.log('🔄 Syncing Schema and Creating User...');
  
  try {
    // Step 1: Check if we have service role key
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY === 'your-service-role-key-here') {
      console.log('⚠️ Service role key not found in environment');
      console.log('📝 Creating migration to sync schema instead...');
      
      // Create a migration file to sync schema
      const migrationSQL = `
-- Migration: Sync CineVerse Schema with Remote
-- Add username column to profiles table if it doesn't exist

-- Add username column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='username'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN username text;
        CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_key ON public.profiles USING btree (username);
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
    END IF;
END
$$;

-- Update existing profiles to have username based on email
UPDATE public.profiles 
SET username = SPLIT_PART(email, '@', 1)
WHERE username IS NULL AND email IS NOT NULL;

-- Ensure username is not null for new profiles
ALTER TABLE public.profiles ALTER COLUMN username SET NOT NULL;

-- Drop existing policies and recreate with proper structure
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Recreate policies
CREATE POLICY "Enable read access for all users"
ON public.profiles FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
`;

      console.log('📄 Migration SQL generated:');
      console.log(migrationSQL);
      
      // Write migration to file
      const fs = await import('fs');
      const path = await import('path');
      
      const migrationFile = path.join(process.cwd(), 'supabase', 'migrations', `${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}_sync_profiles_schema.sql`);
      
      fs.writeFileSync(migrationFile, migrationSQL);
      console.log(`✅ Migration file created: ${migrationFile}`);
      
      return;
    }

    // Step 2: If we have service role, sync schema directly
    console.log('🔧 Using service role to sync schema...');
    
    // Add username column if it doesn't exist
    const { error: alterError } = await serviceSupabase.rpc('exec_sql', {
      sql: `
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name='profiles' AND column_name='username'
            ) THEN
                ALTER TABLE public.profiles ADD COLUMN username text;
            END IF;
        END
        $$;
      `
    });

    if (alterError) {
      console.error('❌ Schema sync error:', alterError.message);
    } else {
      console.log('✅ Schema synced successfully');
    }

    // Step 3: Create user manually using service role
    console.log('👤 Creating user ankun.n.m@gmail.com...');
    
    let newUser: any = null;
    
    const { data: createdUser, error: createUserError } = await serviceSupabase.auth.admin.createUser({
      email: 'ankun.n.m@gmail.com',
      password: '@iamAnKun',
      email_confirm: true
    });

    if (createUserError) {
      if (createUserError.message.includes('already registered')) {
        console.log('ℹ️ User already exists, trying to get user info...');
        
        const { data: existingUser } = await serviceSupabase.auth.admin.listUsers();
        const user = existingUser.users.find(u => u.email === 'ankun.n.m@gmail.com');
        
        if (user) {
          console.log('✅ Found existing user:', user.id);
          newUser = { user: { id: user.id, email: user.email } };
        }
      } else {
        console.error('❌ Create user error:', createUserError.message);
        return;
      }
    } else {
      console.log('✅ User created successfully:', createdUser.user?.id);
      newUser = createdUser;
    }

    // Step 4: Create profile for user
    console.log('📋 Creating profile for user...');
    
    const { data: profile, error: profileError } = await serviceSupabase
      .from('profiles')
      .upsert({
        id: newUser.user?.id,
        email: 'ankun.n.m@gmail.com',
        username: 'ankun',
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

    // Step 5: Test with anon key
    console.log('🔐 Testing with anon key...');
    
    const { data: signInData, error: signInError } = await anonSupabase.auth.signInWithPassword({
      email: 'ankun.n.m@gmail.com',
      password: '@iamAnKun',
    });

    if (signInError) {
      console.error('❌ Sign in still failed:', signInError.message);
    } else {
      console.log('✅ Sign in successful with anon key!');
      console.log('👤 User:', signInData.user?.email);
    }

    console.log('🎉 Schema sync and user creation completed!');

  } catch (error) {
    console.error('❌ Process failed:', error);
  }
}

syncSchemaAndCreateUser().catch(console.error);
