-- Diagnose Authentication Issues

-- Step 1: Check if profiles table exists and its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Check existing profiles data
SELECT * FROM public.profiles LIMIT 10;

-- Step 3: Check auth users
SELECT id, email, created_at, last_sign_in_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- Step 4: Check existing RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- Step 5: Test direct auth call (replace with actual credentials)
-- SELECT * FROM auth.sign_in('your-email@example.com', 'your-password');

-- Step 6: Check if user has profile after login
SELECT p.id, p.username, p.user_id, u.email
FROM public.profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'your-email@example.com';

-- Step 7: Check migration history
SELECT version, name, statements, executed_at
FROM supabase_migrations.schema_migrations
ORDER BY executed_at DESC;

-- Step 8: Check if RLS is enabled
SELECT relname, relrowsecurity, relforcerowsecurity
FROM pg_class 
WHERE relname = 'profiles' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
