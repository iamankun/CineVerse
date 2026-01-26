-- Check if user exists in auth.users but not in profiles

-- Step 1: Find users without profiles
SELECT 
    u.id,
    u.email,
    u.created_at as user_created,
    p.username,
    p.created_at as profile_created
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- Step 2: Check specific user (replace with actual email)
SELECT 
    u.id,
    u.email,
    u.created_at as user_created,
    p.username,
    p.created_at as profile_created
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'your-email@example.com';

-- Step 3: Count users vs profiles
SELECT 
    (SELECT COUNT(*) FROM auth.users) as total_users,
    (SELECT COUNT(*) FROM public.profiles) as total_profiles,
    (SELECT COUNT(*) FROM auth.users u LEFT JOIN public.profiles p ON u.id = p.id WHERE p.id IS NULL) as users_without_profiles;
