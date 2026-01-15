-- Final diagnostic queries
-- 1. Check if auth.users table exists
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'auth' AND table_name = 'users';

-- 2. Try to select from auth.users directly
SELECT COUNT(*) as user_count FROM auth.users;

-- 3. Check all tables in auth schema
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'auth' 
ORDER BY table_name;

-- 4. Check if profiles table exists in public schema
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'profiles';

-- 5. Try direct select from profiles
SELECT COUNT(*) as profile_count FROM public.profiles;
