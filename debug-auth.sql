-- Debug Authentication Issues

-- Step 1: Check if user exists in auth.users
SELECT id, email, created_at, last_sign_in_at 
FROM auth.users 
WHERE email = 'your-email@example.com';

-- Step 2: Check if profile exists in public.profiles
SELECT id, username, user_id, created_at 
FROM public.profiles 
WHERE user_id = 'your-user-id';

-- Step 3: Check RLS policies
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

-- Step 4: Test direct auth call
SELECT * FROM auth.sign_in('your-email@example.com', 'your-password');

-- Step 5: Check if user has profile after login
SELECT p.id, p.username, p.user_id, u.email
FROM public.profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'your-email@example.com';
